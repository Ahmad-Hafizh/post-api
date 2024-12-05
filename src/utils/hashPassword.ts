import { hash, genSalt } from 'bcrypt';

// salt code khusus yang digunakan encoding decoding = data yg di gunakan untuk meemberi proteksi pada data baru
export const hashPassword = async (password: string) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};
