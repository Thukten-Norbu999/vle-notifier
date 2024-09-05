// class Model{
//     constructor(table_name){
//         this.name = table_name
//     };

//     charField(max_length, ){};

//     intField(){};

//     dateField(){};

    
// }

// Model.charField()


import { query } from '../config/db';




const User = {
  create: (userData, callback) => {
    const sql = 'INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)';
    query(sql, [userData.enrollmentNo, userData.email, userData.password], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  findAll: (callback) => {
    const sql = 'SELECT * FROM users';
    query(sql, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  findById: (id, callback) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    query(sql, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  update: (id, userData, callback) => {
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?';
    query(sql, [userData.firstName, userData.lastName, userData.email, id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  delete: (id, callback) => {
    const sql = 'DELETE FROM users WHERE id = ?';
    query(sql, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  }
};

const EnrolledCourse = {
  create: (data, callback) => {
    const sql = 'INSERT INTO '
    return
  },
}

export default User;
