import bcrypt from 'bcrypt';
import { query } from './db.js';

// const records = [
//   {
//     id: 1,
//     username: 'admin',
//     name: 'Hr. admin',

//     // 123
//     password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
//     admin: true,
//   },
//   {
//     id: 2,
//     username: 'oli',
//     name: 'Óli',

//     // 123
//     password: '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii',
//     admin: false,
//   },
// ];

export async function comparePasswords(password, user) {
  const ok = await bcrypt.compare(password, user.password);

  if (ok) {
    return user;
  }

  return false;
}

// // Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// // app.js gerir ráð fyrir async falli
// export async function findByUsername(username) {
//   const found = records.find((u) => u.username === username);

//   if (found) {
//     return found;
//   }

//   return null;
// }

// // Merkjum sem async þó ekki verið að nota await, þar sem þetta er notað í
// // app.js gerir ráð fyrir async falli
// export async function findById(id) {
//   const found = records.find((u) => u.id === id);

//   if (found) {
//     return found;
//   }

//   return null;
// }




export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);
    
    if (result?.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('findByUsername: Fann ekki notanda. Villa skedi.', e);
  }

  return false;
}

export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('findById: Fann ekki notanda. Villa skedi.', e);
  }

  return null;
}

export async function createUser(name, username, password) {
  // TODO validate password og skila villu ef ekki valid
  const hashedPassword = await bcrypt.hash(password, 11);

  const q = `INSERT INTO users (name, username, password)
    VALUES ($1, $2, $3) RETURNING *`;

  const result = await query(q, [name, username, hashedPassword]);

  if (result?.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}
