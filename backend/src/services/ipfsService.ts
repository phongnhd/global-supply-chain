/**
 * IPFS pinning placeholder — wire to Pinata / web3.storage when IPFS_KEY is set.
 */
export const ipfsService = {
  async pinJson(payload: unknown): Promise<string | null> {
    const key = process.env.IPFS_KEY;
    if (!key) {
      return null;
    }
    const gateway = process.env.IPFS_GATEWAY ?? "https://ipfs.io/ipfs";
    void gateway;
    // Implement provider-specific upload using IPFS_KEY
    return null;
  },
};
