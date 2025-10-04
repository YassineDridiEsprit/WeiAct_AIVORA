const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parcel = sequelize.define('Parcel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  culture: {
    type: DataTypes.ENUM('ORANGE', 'POTATO', 'TOMATO', 'LEMON', 'OLIVE', 'PEACH', 'WHEAT', 'BARLEY', 'NONE'),
    defaultValue: 'NONE'
  },
  soil_type: {
    type: DataTypes.ENUM('clay', 'silt', 'sand', 'loam'),
    defaultValue: 'loam'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  boundary: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const boundary = this.getDataValue('boundary');
      return boundary ? JSON.parse(boundary) : null;
    },
    set(value) {
      this.setDataValue('boundary', value ? JSON.stringify(value) : null);
    }
  },
  area_hectares: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  },
  perimeter_km: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  }
}, {
  tableName: 'parcels'
});

// Instance methods
Parcel.prototype.calculateAreaAndPerimeter = function() {
  if (!this.boundary || !this.boundary.coordinates) {
    return;
  }

  try {
    const coords = this.boundary.coordinates[0];
    if (coords.length < 3) return;

    // Simple area calculation using shoelace formula
    let area = 0;
    let perimeter = 0;
    
    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      
      // Shoelace formula for area
      area += x1 * y2 - x2 * y1;
      
      // Distance calculation for perimeter
      const dx = x2 - x1;
      const dy = y2 - y1;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    // Close the polygon
    const [x1, y1] = coords[coords.length - 1];
    const [x2, y2] = coords[0];
    area += x1 * y2 - x2 * y1;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    perimeter += Math.sqrt(dx * dx + dy * dy);

    area = Math.abs(area) / 2;
    
    // Convert to approximate hectares and kilometers
    // This is a simplified conversion - in production you'd use proper projection
    this.area_hectares = (area * 111000 * 111000) / 10000; // rough conversion
    this.perimeter_km = (perimeter * 111000) / 1000; // rough conversion
    
    // Calculate centroid
    let centroidX = 0, centroidY = 0;
    for (const [x, y] of coords) {
      centroidX += x;
      centroidY += y;
    }
    centroidX /= coords.length;
    centroidY /= coords.length;
    
    this.latitude = centroidY;
    this.longitude = centroidX;
  } catch (error) {
    console.error('Error calculating area and perimeter:', error);
  }
};

// Hooks
Parcel.addHook('beforeSave', 'calculateGeometry', function(parcel) {
  if (parcel.changed('boundary') && parcel.boundary) {
    parcel.calculateAreaAndPerimeter();
  }
});

module.exports = Parcel;
