export interface exitInfo {
  key: string;
  country: string;
  city: string;
  plus: boolean;
}

export const exitList: { [key: string]: exitInfo } = {
  "us-hio-01.exits.geph.io": {
    key: "2f8571e4795032433098af285c0ce9e43c973ac3ad71bf178e4f2aaa39794aec",
    country: "us",
    city: "pdx",
    plus: false,
  },
  "ca-mtl-01.exits.geph.io": {
    key: "8d848fe736ead2f0b78cd13e81293944936fe840ea449b8f87438340ecdaaaf6",
    country: "ca",
    city: "mtl",
    plus: false,
  },
  "ch-gva-01.exits.geph.io": {
    key: "c1b74b5d47286d97dd6a56ec574488775210ca7e44da506c011b17764660a34a",
    country: "ch",
    city: "gva",
    plus: false,
  },
  "fi-hel-01.exits.geph.io": {
    key: "3cbdf1ada46e2fe0e2a1919990cec3c1e7d277ec7da99880ce7867004d791048",
    country: "fi",
    city: "hel",
    plus: false,
  },
  "jp-tyo-01.exits.geph.io": {
    key: "107b64be61eef80a863362b84c7ebc730f81e903697c6e632f2908a62a60163d",
    country: "jp",
    city: "tyo",
    plus: true,
  },
  "tw-tpe-01.exits.geph.io": {
    key: "5644ca0ea161be432ceca53d5e228d1e2b4ee83222d7a35153a52ad499723439",
    country: "tw",
    city: "tpe",
    plus: true,
  },
  "sg-sgp-01.exits.geph.io": {
    key: "2f1d296bcc56cdd84e7276ebea91f131d64a4021a385ee0f6f0ecbdffe8b2342",
    country: "sg",
    city: "sgp",
    plus: true,
  },
};
