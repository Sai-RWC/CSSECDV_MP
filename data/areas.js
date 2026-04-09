const labs = [
  { value: 1, name: 'Lab 1' },
  { value: 2, name: 'Lab 2' },
  { value: 3, name: 'Lab 3' },
  { value: 4, name: 'Lab 4' },
  { value: 5, name: 'Lab 5' }
];

const areas = [
  {
    upper: [
      { id: 'A1', img: '/Assets/icons/chair1.svg' },
      { id: 'A2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableA.svg',
    mid: { id: 'A5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'A3', img: '/Assets/icons/chair3.svg' },
      { id: 'A4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'B1', img: '/Assets/icons/chair1.svg' },
      { id: 'B2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableB.svg',
    mid: { id: 'B5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'B3', img: '/Assets/icons/chair3.svg' },
      { id: 'B4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'C1', img: '/Assets/icons/chair1.svg' },
      { id: 'C2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableC.svg',
    mid: { id: 'C5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'C3', img: '/Assets/icons/chair3.svg' },
      { id: 'C4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'D1', img: '/Assets/icons/chair1.svg' },
      { id: 'D2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableD.svg',
    mid: { id: 'D5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'D3', img: '/Assets/icons/chair3.svg' },
      { id: 'D4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'E1', img: '/Assets/icons/chair1.svg' },
      { id: 'E2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableE.svg',
    mid: { id: 'E5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'E3', img: '/Assets/icons/chair3.svg' },
      { id: 'E4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'F1', img: '/Assets/icons/chair1.svg' },
      { id: 'F2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableF.svg',
    mid: { id: 'F5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'F3', img: '/Assets/icons/chair3.svg' },
      { id: 'F4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'G1', img: '/Assets/icons/chair1.svg' },
      { id: 'G2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableG.svg',
    mid: { id: 'G5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'G3', img: '/Assets/icons/chair3.svg' },
      { id: 'G4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'H1', img: '/Assets/icons/chair1.svg' },
      { id: 'H2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableH.svg',
    mid: { id: 'H5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'H3', img: '/Assets/icons/chair3.svg' },
      { id: 'H4', img: '/Assets/icons/chair4.svg' }
    ]
  },
  {
    upper: [
      { id: 'I1', img: '/Assets/icons/chair1.svg' },
      { id: 'I2', img: '/Assets/icons/chair2.svg' }
    ],
    table: '/Assets/icons/tableI.svg',
    mid: { id: 'I5', img: '/Assets/icons/chair5.svg', onclick: 'openPopRes(event)' },
    lower: [
      { id: 'I3', img: '/Assets/icons/chair3.svg' },
      { id: 'I4', img: '/Assets/icons/chair4.svg' }
    ]
  }
];

module.exports = { labs, areas };
