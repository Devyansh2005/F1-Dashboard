const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'f1_dashboard.db');

// Rich biographical data in the style of Kym Millman for the top drivers
const RICH_DRIVER_PROFILES = {
  'antonelli': {
    placeOfBirth: 'Bologna, Italy',
    height: '1.76 m',
    weight: '63 kg',
    team: 'Mercedes-AMG',
    firstRace: '2026 Bahrain Grand Prix',
    careerPodiums: 5,
    careerWins: 5,
    manager: 'Toto Wolff',
    trainer: 'Mercedes Staff',
    languages: 'Italian, English',
    helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2025/drivers/ANDANT01.png'
  },
  'hamilton': {
    placeOfBirth: 'Stevenage, Hertfordshire, UK',
    height: '1.74 m',
    weight: '73 kg',
    team: 'Scuderia Ferrari',
    firstRace: '2007 Australian Grand Prix',
    careerPodiums: 202,
    careerWins: 104,
    manager: 'Penni Thow',
    trainer: 'Steve Lord',
    languages: 'English',
    helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/LEWHAM01.png'
  },
  'russell': {
    placeOfBirth: 'King\'s Lynn, Norfolk, UK',
    height: '1.85 m',
    weight: '70 kg',
    team: 'Mercedes-AMG',
    firstRace: '2019 Australian Grand Prix',
    careerPodiums: 15,
    careerWins: 3,
    manager: 'Mercedes Management',
    trainer: 'Aleix Casanovas',
    languages: 'English',
    helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/GEORUS01.png'
  },
  'leclerc': {
    placeOfBirth: 'Monte Carlo, Monaco',
    height: '1.80 m',
    weight: '69 kg',
    team: 'Scuderia Ferrari',
    firstRace: '2018 Australian Grand Prix',
    careerPodiums: 32,
    careerWins: 6,
    manager: 'Nicolas Todt',
    trainer: 'Andrea Ferrari',
    languages: 'French, Italian, English',
    helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/CHALEC01.png'
  },
  'norris': {
    placeOfBirth: 'Bristol, Gloucestershire, UK',
    height: '1.70 m',
    weight: '68 kg',
    team: 'McLaren',
    firstRace: '2019 Australian Grand Prix',
    careerPodiums: 26,
    careerWins: 2,
    manager: 'Mark Berryman',
    trainer: 'Jon Malvern',
    languages: 'English',
    helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/LANNOR01.png'
  },
  'piastri': {
    placeOfBirth: 'Melbourne, Victoria, Australia',
    height: '1.78 m',
    weight: '68 kg',
    team: 'McLaren',
    firstRace: '2023 Bahrain Grand Prix',
    careerPodiums: 10,
    careerWins: 2,
    manager: 'Mark Webber',
    trainer: 'Kim Keedle',
    languages: 'English',
    helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/OSCPIA01.png'
  },
  'verstappen': {
    placeOfBirth: 'Hasselt, Belgium',
    height: '1.81 m',
    weight: '72 kg',
    team: 'Red Bull Racing',
    firstRace: '2015 Australian Grand Prix',
    careerPodiums: 106,
    careerWins: 61,
    manager: 'Raymond Vermeulen',
    trainer: 'Rupert Manwaring',
    languages: 'Dutch, English, German',
    helmetBrand: 'Schuberth',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/MAXVER01.png'
  },
  'gasly': {
    placeOfBirth: 'Rouen, Normandy, France',
    height: '1.77 m',
    weight: '70 kg',
    team: 'Alpine',
    firstRace: '2017 Malaysian Grand Prix',
    careerPodiums: 4,
    careerWins: 1,
    manager: 'Guillaume Le Goff',
    trainer: 'Pyry Salmela',
    languages: 'French, English, Italian',
    helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/PIEGAS01.png'
  },
  'hadjar': {
    placeOfBirth: 'Paris, Île-de-France, France',
    height: '1.70 m',
    weight: '62 kg',
    team: 'Red Bull Racing',
    firstRace: '2026 Bahrain Grand Prix',
    careerPodiums: 1,
    careerWins: 0,
    manager: 'Red Bull Academy',
    trainer: 'Red Bull Trainer',
    languages: 'French, English',
    helmetBrand: 'Arai',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2025/drivers/ISAHAD01.png'
  },
  'lawson': {
    placeOfBirth: 'Hastings, Hawke\'s Bay, New Zealand',
    height: '1.74 m',
    weight: '65 kg',
    team: 'Racing Bulls',
    firstRace: '2023 Dutch Grand Prix',
    careerPodiums: 0,
    careerWins: 0,
    manager: 'Ken Smith',
    trainer: 'Racing Bulls Trainer',
    languages: 'English',
    helmetBrand: 'Arai',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/LIALAW01.png'
  }
};

async function seed() {
  console.log('Fetching 2026 driver list from Jolpi F1 API...');
  let apiDrivers = [];
  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/2026/drivers.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    apiDrivers = data.MRData.DriverTable.Drivers;
    console.log(`Fetched ${apiDrivers.length} drivers successfully.`);
  } catch (err) {
    console.error('Failed to fetch from API, falling back to static roster:', err.message);
    // Fallback static list in case of network issues
    apiDrivers = [
      { driverId: 'antonelli', permanentNumber: '12', code: 'ANT', url: '', givenName: 'Andrea Kimi', familyName: 'Antonelli', dateOfBirth: '2006-08-25', nationality: 'Italian' },
      { driverId: 'hamilton', permanentNumber: '44', code: 'HAM', url: '', givenName: 'Lewis', familyName: 'Hamilton', dateOfBirth: '1985-01-07', nationality: 'British' },
      { driverId: 'russell', permanentNumber: '63', code: 'RUS', url: '', givenName: 'George', familyName: 'Russell', dateOfBirth: '1998-02-15', nationality: 'British' },
      { driverId: 'leclerc', permanentNumber: '16', code: 'LEC', url: '', givenName: 'Charles', familyName: 'Leclerc', dateOfBirth: '1997-10-16', nationality: 'Monegasque' },
      { driverId: 'norris', permanentNumber: '4', code: 'NOR', url: '', givenName: 'Lando', familyName: 'Norris', dateOfBirth: '1999-11-13', nationality: 'British' },
      { driverId: 'piastri', permanentNumber: '81', code: 'PIA', url: '', givenName: 'Oscar', familyName: 'Piastri', dateOfBirth: '2001-04-06', nationality: 'Australian' },
      { driverId: 'verstappen', permanentNumber: '1', code: 'VER', url: '', givenName: 'Max', familyName: 'Verstappen', dateOfBirth: '1997-09-30', nationality: 'Dutch' },
      { driverId: 'gasly', permanentNumber: '10', code: 'GAS', url: '', givenName: 'Pierre', familyName: 'Gasly', dateOfBirth: '1996-02-07', nationality: 'French' },
      { driverId: 'hadjar', permanentNumber: '6', code: 'HAD', url: '', givenName: 'Isack', familyName: 'Hadjar', dateOfBirth: '2004-09-28', nationality: 'French' },
      { driverId: 'lawson', permanentNumber: '30', code: 'LAW', url: '', givenName: 'Liam', familyName: 'Lawson', dateOfBirth: '2002-02-11', nationality: 'New Zealander' }
    ];
  }

  // Create SQLite Database
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the SQLite database.');
  });

  db.serialize(() => {
    // Drop table if exists to refresh
    db.run('DROP TABLE IF EXISTS drivers');

    // Create table with Kaggle/Ergast baseline + Kym Millman metadata
    db.run(`
      CREATE TABLE IF NOT EXISTS drivers (
        driverId TEXT PRIMARY KEY,
        permanentNumber INTEGER,
        code TEXT,
        url TEXT,
        givenName TEXT,
        familyName TEXT,
        dateOfBirth TEXT,
        nationality TEXT,
        placeOfBirth TEXT,
        height TEXT,
        weight TEXT,
        team TEXT,
        firstRace TEXT,
        careerPodiums INTEGER,
        careerWins INTEGER,
        manager TEXT,
        trainer TEXT,
        languages TEXT,
        helmetBrand TEXT,
        imageUrl TEXT
      )
    `);

    console.log('Drivers table created.');

    const stmt = db.prepare(`
      INSERT INTO drivers (
        driverId, permanentNumber, code, url, givenName, familyName, dateOfBirth, nationality,
        placeOfBirth, height, weight, team, firstRace, careerPodiums, careerWins,
        manager, trainer, languages, helmetBrand, imageUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    apiDrivers.forEach((d) => {
      const rich = RICH_DRIVER_PROFILES[d.driverId] || {};
      stmt.run(
        d.driverId,
        d.permanentNumber ? parseInt(d.permanentNumber) : null,
        d.code || null,
        d.url || null,
        d.givenName,
        d.familyName,
        d.dateOfBirth,
        d.nationality,
        rich.placeOfBirth || 'Unknown',
        rich.height || 'N/A',
        rich.weight || 'N/A',
        rich.team || 'Unknown Team',
        rich.firstRace || 'N/A',
        rich.careerPodiums || 0,
        rich.careerWins || 0,
        rich.manager || 'N/A',
        rich.trainer || 'N/A',
        rich.languages || d.nationality,
        rich.helmetBrand || 'N/A',
        rich.imageUrl || `/images/drivers/placeholder.jpg`
      );
    });

    stmt.finalize();
    console.log('Database seeded with all F1 drivers.');
  });

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
}

seed();
