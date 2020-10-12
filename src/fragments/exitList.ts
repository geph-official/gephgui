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
  "sg-sgp-01.exits.geph.io": {
    key: "2f1d296bcc56cdd84e7276ebea91f131d64a4021a385ee0f6f0ecbdffe8b2342",
    country: "sg",
    city: "sgp",
    plus: true,
  },
};
