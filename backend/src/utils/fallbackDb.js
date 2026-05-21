const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../db.json');

// Ensure db directory and file exist
const ensureDb = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], itineraries: [] }, null, 2));
  }
};

const readDb = () => {
  ensureDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], itineraries: [] };
  }
};

const writeDb = (data) => {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

class QueryChain {
  constructor(data) {
    this.data = data;
  }

  sort(options) {
    if (Array.isArray(this.data) && options && options.createdAt !== undefined) {
      const order = options.createdAt;
      this.data = [...this.data].sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return order === -1 ? timeB - timeA : timeA - timeB;
      });
    }
    return this;
  }

  populate(pathStr, selectStr) {
    if (this.data) {
      const db = readDb();
      if (Array.isArray(this.data)) {
        this.data = this.data.map(item => this._populateItem(item, pathStr, db));
      } else {
        this.data = this._populateItem(this.data, pathStr, db);
      }
    }
    return this;
  }

  _populateItem(item, pathStr, db) {
    if (!item) return item;
    const newItem = { ...item };
    if (pathStr === 'user' && newItem.user) {
      const userId = newItem.user.toString();
      const user = db.users.find(u => u._id === userId);
      if (user) {
        newItem.user = {
          _id: user._id,
          name: user.name,
          email: user.email
        };
      }
    }
    return newItem;
  }

  // Promise-like behavior
  then(onResolve, onReject) {
    return Promise.resolve(this.data).then(onResolve, onReject);
  }

  catch(onReject) {
    return Promise.resolve(this.data).catch(onReject);
  }
}

// Generate a random 24-character hex ID (similar to MongoDB ObjectId)
const generateId = () => {
  return require('crypto').randomBytes(12).toString('hex');
};

const createMockModel = (collectionName) => {
  return {
    create: async (docData) => {
      const db = readDb();
      const newDoc = {
        _id: generateId(),
        ...docData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db[collectionName].push(newDoc);
      writeDb(db);
      return newDoc;
    },

    find: (query = {}) => {
      const db = readDb();
      let results = db[collectionName];
      
      // Handle simple equality filter
      if (query && Object.keys(query).length > 0) {
        results = results.filter(item => {
          return Object.entries(query).every(([key, value]) => {
            if (item[key] === undefined) return false;
            return item[key].toString() === value.toString();
          });
        });
      }
      return new QueryChain(results);
    },

    findOne: (query = {}) => {
      const db = readDb();
      let results = db[collectionName];
      
      if (query && Object.keys(query).length > 0) {
        results = results.filter(item => {
          return Object.entries(query).every(([key, value]) => {
            if (item[key] === undefined) return false;
            return item[key].toString() === value.toString();
          });
        });
      }
      
      const found = results.length > 0 ? results[0] : null;
      return new QueryChain(found);
    },

    findById: (id) => {
      const db = readDb();
      const found = db[collectionName].find(item => item._id.toString() === id.toString()) || null;
      return new QueryChain(found);
    },

    findByIdAndDelete: async (id) => {
      const db = readDb();
      const index = db[collectionName].findIndex(item => item._id.toString() === id.toString());
      if (index === -1) return null;
      const removed = db[collectionName].splice(index, 1)[0];
      writeDb(db);
      return removed;
    },

    findByIdAndUpdate: async (id, updateData) => {
      const db = readDb();
      const index = db[collectionName].findIndex(item => item._id.toString() === id.toString());
      if (index === -1) return null;
      
      let finalUpdates = updateData;
      if (updateData && updateData.$set) {
        finalUpdates = updateData.$set;
      }
      
      const updatedItem = {
        ...db[collectionName][index],
        ...finalUpdates,
        updatedAt: new Date().toISOString()
      };
      
      db[collectionName][index] = updatedItem;
      writeDb(db);
      return updatedItem;
    },

    deleteOne: async (query = {}) => {
      const db = readDb();
      const index = db[collectionName].findIndex(item => {
        return Object.entries(query).every(([key, value]) => {
          if (item[key] === undefined) return false;
          return item[key].toString() === value.toString();
        });
      });
      if (index === -1) return { deletedCount: 0 };
      db[collectionName].splice(index, 1);
      writeDb(db);
      return { deletedCount: 1 };
    }
  };
};

module.exports = {
  User: createMockModel('users'),
  Itinerary: createMockModel('itineraries')
};
