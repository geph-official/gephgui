export interface exitInfo {
  key: string;
  country: string;
  city: string;
  plus: boolean;
}

export const exitList: { [key: string]: exitInfo } = {
  "us-sfo-01.exits.geph.io": {
    key: "2f8571e4795032433098af285c0ce9e43c973ac3ad71bf178e4f2aaa39794aec",
    country: "us",
    city: "pdx",
    plus: false
  },
  "ch-gva-01.exits.geph.io": {
    key: "c1b74b5d47286d97dd6a56ec574488775210ca7e44da506c011b17764660a34a",
    country: "ch",
    city: "gva",
    plus: false
  },
  "jp-tyo-01.exits.geph.io": {
    key: "107b64be61eef80a863362b84c7ebc730f81e903697c6e632f2908a62a60163d",
    country: "jp",
    city: "tyo",
    plus: true
  },
  "hk-hkg-01.exits.geph.io": {
    key: "816802fd21f8689897c2abf33a95db23cc2a8d4f5cb996a29a3d85a4919c86b8",
    country: "hk",
    city: "hkgnt",
    plus: true
  },
  "sg-sgp-01.exits.geph.io": {
    key: "2f1d296bcc56cdd84e7276ebea91f131d64a4021a385ee0f6f0ecbdffe8b2342",
    country: "sg",
    city: "sgp",
    plus: true
  }
};
