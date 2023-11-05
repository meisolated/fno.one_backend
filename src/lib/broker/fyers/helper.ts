import crypto from "crypto"
export function getSHA256Hash(inputString: string) {
	const hash = crypto.createHash("sha256")
	hash.update(inputString)
	return hash.digest("hex")
}
