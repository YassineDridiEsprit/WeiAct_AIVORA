#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "quirc.h"

// Camera model
#define CAMERA_MODEL_AI_THINKER

// Pin definitions for AI-Thinker ESP32-CAM
#if defined(CAMERA_MODEL_AI_THINKER)
  #define PWDN_GPIO_NUM     32
  #define RESET_GPIO_NUM    -1
  #define XCLK_GPIO_NUM      0
  #define SIOD_GPIO_NUM     26
  #define SIOC_GPIO_NUM     27
  #define Y9_GPIO_NUM       35
  #define Y8_GPIO_NUM       34
  #define Y7_GPIO_NUM       39
  #define Y6_GPIO_NUM       36
  #define Y5_GPIO_NUM       21
  #define Y4_GPIO_NUM       19
  #define Y3_GPIO_NUM       18
  #define Y2_GPIO_NUM        5
  #define VSYNC_GPIO_NUM    25
  #define HREF_GPIO_NUM     23
  #define PCLK_GPIO_NUM     22
#else
  #error "Camera model not selected"
#endif

// Flash LED pin (GPIO 4)
#define FLASH_LED_PIN     4

// WiFi credentials
const char* ssid = "TT_D408";
const char* password = "raoufyassine2024";

// const char* ssid = "s20";
// const char* password = "yassine20225";

// HTTP server handles
httpd_handle_t camera_httpd = NULL;
httpd_handle_t stream_httpd = NULL;

// Stream constants
#define PART_BOUNDARY "123456789000000000000987654321"
static const char* _STREAM_CONTENT_TYPE = "multipart/x-mixed-replace;boundary=" PART_BOUNDARY;
static const char* _STREAM_BOUNDARY = "\r\n--" PART_BOUNDARY "\r\n";
static const char* _STREAM_PART = "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

// QR code variables
struct quirc *q = NULL;
uint8_t *image = NULL;
struct quirc_code code;
struct quirc_data data;
quirc_decode_error_t err;
String QRCodeResult = "";
TaskHandle_t QRCodeReader_Task;

// LED handler
static esp_err_t led_handler(httpd_req_t *req) {
  char buf[32];
  char brightness_str[10];
  int buf_len = httpd_req_get_url_query_len(req) + 1;

  Serial.print("Flash LED handler: Received request for /led?brightness=");
  
  if (buf_len > 1 && buf_len <= sizeof(buf)) {
    if (httpd_req_get_url_query_str(req, buf, buf_len) == ESP_OK) {
      if (httpd_query_key_value(buf, "brightness", brightness_str, sizeof(brightness_str)) == ESP_OK) {
        int brightness = atoi(brightness_str);
        Serial.println(brightness);
        if (brightness >= 0 && brightness <= 255) {
          ledcWrite(2, brightness); // Correct logic: 0 = OFF, 255 = ON
          httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
          httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET");
          httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");
          httpd_resp_set_type(req, "text/plain");
          char response[50];
          snprintf(response, sizeof(response), "Flash LED brightness set to %d", brightness);
          return httpd_resp_send(req, response, strlen(response));
        } else {
          Serial.println("Invalid brightness value");
        }
      } else {
        Serial.println("Missing brightness parameter");
      }
    } else {
      Serial.println("Failed to get query string");
    }
  } else {
    Serial.println("Query string too long or empty");
  }

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_type(req, "text/plain");
  return httpd_resp_send(req, "Invalid or missing brightness value", HTTPD_RESP_USE_STRLEN);
}

// Capture handler
static esp_err_t capture_handler(httpd_req_t *req) {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    httpd_resp_send_500(req);
    return ESP_FAIL;
  }

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");
  httpd_resp_set_type(req, "image/jpeg");
  httpd_resp_send(req, (const char *)fb->buf, fb->len);
  esp_camera_fb_return(fb);
  Serial.println("Capture successful");
  return ESP_OK;
}

// Stream handler with QR code reading
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t *fb = NULL;
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t *_jpg_buf = NULL;
  char *part_buf[64];
  int fail_count = 0;

  httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET");
  httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "Content-Type");
  res = httpd_resp_set_type(req, _STREAM_CONTENT_TYPE);
  if (res != ESP_OK) {
    Serial.println("Failed to set stream content type");
    return res;
  }

  Serial.println("Stream started");
  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed (stream_handler)");
      fail_count++;
      if (fail_count > 5) {
        Serial.println("Too many failures, reinitializing camera");
        esp_camera_deinit();
        delay(100);
        camera_config_t config;
        config.ledc_channel = LEDC_CHANNEL_0;
        config.ledc_timer = LEDC_TIMER_0;
        config.pin_d0 = Y2_GPIO_NUM;
        config.pin_d1 = Y3_GPIO_NUM;
        config.pin_d2 = Y4_GPIO_NUM;
        config.pin_d3 = Y5_GPIO_NUM;
        config.pin_d4 = Y6_GPIO_NUM;
        config.pin_d5 = Y7_GPIO_NUM;
        config.pin_d6 = Y8_GPIO_NUM;
        config.pin_d7 = Y9_GPIO_NUM;
        config.pin_xclk = XCLK_GPIO_NUM;
        config.pin_pclk = PCLK_GPIO_NUM;
        config.pin_vsync = VSYNC_GPIO_NUM;
        config.pin_href = HREF_GPIO_NUM;
        config.pin_sscb_sda = SIOD_GPIO_NUM;
        config.pin_sscb_scl = SIOC_GPIO_NUM;
        config.pin_pwdn = PWDN_GPIO_NUM;
        config.pin_reset = RESET_GPIO_NUM;
        config.xclk_freq_hz = 10000000;
        config.pixel_format = PIXFORMAT_JPEG;
        config.frame_size = FRAMESIZE_QVGA;
        config.jpeg_quality = 20;
        config.fb_count = 1;
        esp_err_t err = esp_camera_init(&config);
        if (err != ESP_OK) {
          Serial.printf("Camera re-init failed with error 0x%x", err);
          return ESP_FAIL;
        }
        fail_count = 0;
      }
      continue;
    }

    fail_count = 0;

    // QR code processing
    q = quirc_new();
    if (q == NULL) {
      Serial.println("Can't create quirc object");
      esp_camera_fb_return(fb);
      continue;
    }

    quirc_resize(q, fb->width, fb->height);
    image = quirc_begin(q, NULL, NULL);
    memcpy(image, fb->buf, fb->len);
    quirc_end(q);

    int count = quirc_count(q);
    if (count > 0) {
      quirc_extract(q, 0, &code);
      err = quirc_decode(&code, &data);
      if (err) {
        QRCodeResult = "Decoding FAILED";
      } else {
        String qrCodeMessage = "";
        for (int i = 0; i < data.payload_len; i++) {
          qrCodeMessage += (char)data.payload[i];
        }
        Serial.print("QR Code: ");
        Serial.println(qrCodeMessage);
        QRCodeResult = qrCodeMessage;
      }
      Serial.println();
    }

    image = NULL;
    quirc_destroy(q);

    if (fb->format != PIXFORMAT_JPEG) {
      bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
      esp_camera_fb_return(fb);
      fb = NULL;
      if (!jpeg_converted) {
        Serial.println("JPEG compression failed");
        res = ESP_FAIL;
      }
    } else {
      _jpg_buf_len = fb->len;
      _jpg_buf = fb->buf;
    }

    if (res == ESP_OK) {
      size_t hlen = snprintf((char *)part_buf, 64, _STREAM_PART, _jpg_buf_len);
      res = httpd_resp_send_chunk(req, (const char *)part_buf, hlen);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, (const char *)_jpg_buf, _jpg_buf_len);
    }
    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, _STREAM_BOUNDARY, strlen(_STREAM_BOUNDARY));
    }

    if (fb) {
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if (_jpg_buf) {
      free(_jpg_buf);
      _jpg_buf = NULL;
    }

    if (res != ESP_OK) {
      Serial.println("Stream interrupted");
      break;
    }
    delay(50); // Reduce CPU load
  }
  Serial.println("Stream stopped");
  return res;
}

// Start camera server
void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;
  config.stack_size = 4096;
  config.max_open_sockets = 4;
  config.lru_purge_enable = true;
  config.recv_wait_timeout = 5;

  httpd_uri_t capture_uri = {
    .uri       = "/capture",
    .method    = HTTP_GET,
    .handler   = capture_handler,
    .user_ctx  = NULL
  };

  httpd_uri_t led_uri = {
    .uri       = "/led",
    .method    = HTTP_GET,
    .handler   = led_handler,
    .user_ctx  = NULL
  };

  if (httpd_start(&camera_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(camera_httpd, &capture_uri);
    httpd_register_uri_handler(camera_httpd, &led_uri);
    Serial.println("Camera server started on port 80");
  } else {
    Serial.println("Failed to start camera server on port 80");
  }

  config.server_port = 81;
  config.ctrl_port = 81;
  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_uri_t stream_uri = {
      .uri       = "/stream",
      .method    = HTTP_GET,
      .handler   = stream_handler,
      .user_ctx  = NULL
    };
    httpd_register_uri_handler(stream_httpd, &stream_uri);
    Serial.println("Stream server started on port 81");
  } else {
    Serial.println("Failed to start stream server on port 81");
  }

  Serial.println("Camera server started");
  Serial.print("Capture Image: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/capture");
  Serial.print("Camera Stream: http://");
  Serial.print(WiFi.localIP());
  Serial.println(":81/stream");
  Serial.print("Flash LED Control: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/led?brightness=<0-255>");
}

void setup() {
  // Initialize flash LED to OFF (LOW due to correct logic)
  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW); // Ensure flash LED is OFF
  delay(500); // Stabilize state

  // Initialize PWM for flash LED
  ledcSetup(2, 5000, 8); // Channel 2, 5kHz, 8-bit resolution
  ledcAttachPin(FLASH_LED_PIN, 2);
  ledcWrite(2, 0); // Flash LED OFF (0 = OFF)

  // Disable brownout detector
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);

  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  // Camera configuration
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 20;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    ESP.restart();
  }

  sensor_t *s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_QVGA);
  s->set_quality(s, 20);

  Serial.println("Camera initialized successfully");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  WiFi.setTxPower(WIFI_POWER_8_5dBm);
  int timeout = 40; // 20 seconds
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(FLASH_LED_PIN, LOW); // Reinforce OFF
    if (timeout-- <= 0) {
      Serial.println("WiFi connection timed out");
      ESP.restart();
    }
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("RSSI: ");
  Serial.println(WiFi.RSSI());
  Serial.print("Free Heap: ");
  Serial.println(ESP.getFreeHeap());

  startCameraServer();
}

void loop() {
  // Monitor system health every 10 seconds
  static unsigned long last_check = 0;
  if (millis() - last_check > 10000) {
    Serial.print("RSSI: ");
    Serial.println(WiFi.RSSI());
    Serial.print("Free Heap: ");
    Serial.println(ESP.getFreeHeap());
    last_check = millis();
  }
  delay(200); // Reduce CPU load
}