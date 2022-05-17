import { E } from '@endo/eventual-send';
import { assert, details as X } from '@agoric/assert';

const getNftAuctionDetail = async ({ publicFacet, nft }) => {
  return E(publicFacet).getSessionDetailsForKey(nft);
};

const buyNft = async ({
  walletP,
  nft,
  publicFacet,
  nftPurse,
  tokenPurse,
  price,
}) => {
  assert(nft, X`At least one nft must be chosen to purchase`);
  const invitation = await E(publicFacet).makeBidInvitationForKey(nft);
  console.log(nft);
  const offerConfig = {
    // JSONable ID for this offer.  This is scoped to the origin.
    id: Date.now(),
    invitation,
    proposalTemplate: {
      want: {
        Asset: {
          pursePetname: nftPurse.pursePetname,
          value: harden([nft]),
        },
      },
      give: {
        Bid: {
          pursePetname: tokenPurse.pursePetname,
          value: BigInt(price * 1000000),
        },
      },
    },
  };

  return E(walletP).addOffer(offerConfig);
};

export { buyNft, getNftAuctionDetail };
