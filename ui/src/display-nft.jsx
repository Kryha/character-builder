import React from 'react';

export const DisplayNftString = ({ nft, buyAction }) => {
  return (
    <div key={nft}>
      <img src={nft} style={{ scale: 2 }} alt={'nft'} />
      <button
        style={{
          margin: '4px',
          fontSize: '14px',
          background: '#444',
          color: '#FFF',
          borderRadius: '2px',
        }}
        onClick={buyAction}
      >
        BUY
      </button>
    </div>
  );
};

export const DisplayNftObj = ({ nft, buyAction }) => {
  // const decodedNft = JSON.parse(nft);
  return (
    <div key={nft.name}>
      <img src={nft.url} style={{ scale: 2 }} alt={'nft'} />
      <div style={{}}>
        <h2 style={{ fontSize: '14px' }}>{nft.name}</h2>
      </div>
      <button
        style={{
          margin: '4px',
          fontSize: '14px',
          background: '#444',
          color: '#FFF',
          borderRadius: '2px',
        }}
        onClick={() => buyAction()}
      >
        BUY
      </button>
    </div>
  );
};
