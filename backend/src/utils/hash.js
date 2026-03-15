import bcrypt from "bcrypt";
export async function hashpassword(password) {
    return await bcrypt.hash(password,10)
}
export async function comparepassword(password,hash) {
    return await bcrypt.compare(password,hash)
}