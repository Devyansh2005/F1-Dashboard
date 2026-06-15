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

// Additional enriched profiles for the rest of the 2026 grid
const MORE_PROFILES = {
  'max_verstappen': {
    placeOfBirth: 'Hasselt, Belgium',
    height: '1.81 m', weight: '72 kg',
    firstRace: '2015 Australian Grand Prix',
    careerPodiums: 106, careerWins: 61,
    manager: 'Raymond Vermeulen', trainer: 'Rupert Manwaring',
    languages: 'Dutch, English, German', helmetBrand: 'Schuberth',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/MAXVER01.png'
  },
  'sainz': {
    placeOfBirth: 'Madrid, Spain',
    height: '1.78 m', weight: '66 kg',
    firstRace: '2015 Australian Grand Prix',
    careerPodiums: 25, careerWins: 3,
    manager: 'Carlos Sainz Sr.', trainer: 'Rupert Manwaring',
    languages: 'Spanish, English, Italian', helmetBrand: 'Schuberth',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/CARSAI01.png'
  },
  'alonso': {
    placeOfBirth: 'Oviedo, Asturias, Spain',
    height: '1.71 m', weight: '68 kg',
    firstRace: '2001 Australian Grand Prix',
    careerPodiums: 106, careerWins: 32,
    manager: 'Flavio Briatore', trainer: 'Fabrizio Borra',
    languages: 'Spanish, English, Italian', helmetBrand: 'Arai',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/FERALO01.png'
  },
  'albon': {
    placeOfBirth: 'London, UK',
    height: '1.86 m', weight: '74 kg',
    firstRace: '2019 Australian Grand Prix',
    careerPodiums: 2, careerWins: 0,
    manager: 'Kiefer Sutherland Management', trainer: 'Patrick Ivie',
    languages: 'English, Thai', helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/ALEALB01.png'
  },
  'stroll': {
    placeOfBirth: 'Montreal, Quebec, Canada',
    height: '1.82 m', weight: '70 kg',
    firstRace: '2017 Australian Grand Prix',
    careerPodiums: 3, careerWins: 0,
    manager: 'Lawrence Stroll', trainer: 'Henry Mayowa',
    languages: 'English, French, Italian', helmetBrand: 'Arai',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/LANSTR01.png'
  },
  'hulkenberg': {
    placeOfBirth: 'Emmerich am Rhein, Germany',
    height: '1.84 m', weight: '74 kg',
    firstRace: '2010 Bahrain Grand Prix',
    careerPodiums: 0, careerWins: 0,
    manager: 'Werner Heinz', trainer: 'Mike Caulfield',
    languages: 'German, English', helmetBrand: 'Schuberth',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/NICHUL01.png'
  },
  'ocon': {
    placeOfBirth: 'Évreux, Normandy, France',
    height: '1.85 m', weight: '66 kg',
    firstRace: '2016 Belgian Grand Prix',
    careerPodiums: 3, careerWins: 1,
    manager: 'Mercedes Junior Programme', trainer: 'Andy Chadwick',
    languages: 'French, English, Spanish', helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/ESTOCO01.png'
  },
  'bottas': {
    placeOfBirth: 'Nastola, Finland',
    height: '1.73 m', weight: '69 kg',
    firstRace: '2013 Australian Grand Prix',
    careerPodiums: 67, careerWins: 10,
    manager: 'Didier Coton', trainer: 'Antti Vierula',
    languages: 'Finnish, English', helmetBrand: 'Stilo',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/VALBOT01.png'
  },
  'bearman': {
    placeOfBirth: 'Chelmsford, Essex, UK',
    height: '1.75 m', weight: '65 kg',
    firstRace: '2024 Saudi Arabian Grand Prix',
    careerPodiums: 0, careerWins: 0,
    manager: 'Nicolas Todt', trainer: 'N/A',
    languages: 'English, Italian', helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2025/drivers/OLIBEA01.png'
  },
  'colapinto': {
    placeOfBirth: 'Buenos Aires, Argentina',
    height: '1.73 m', weight: '67 kg',
    firstRace: '2024 Italian Grand Prix',
    careerPodiums: 0, careerWins: 0,
    manager: 'Jamie Campbell-Walter', trainer: 'N/A',
    languages: 'Spanish, English, Italian', helmetBrand: 'Arai',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2025/drivers/FRANCOL01.png'
  },
  'bortoleto': {
    placeOfBirth: 'São Paulo, Brazil',
    height: '1.73 m', weight: '63 kg',
    firstRace: '2026 Bahrain Grand Prix',
    careerPodiums: 0, careerWins: 0,
    manager: 'Fernando Alonso Management', trainer: 'N/A',
    languages: 'Portuguese, English', helmetBrand: 'Bell',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2025/drivers/GABBO01.png'
  },
  'perez': {
    placeOfBirth: 'Guadalajara, Jalisco, Mexico',
    height: '1.73 m', weight: '63 kg',
    firstRace: '2011 Australian Grand Prix',
    careerPodiums: 39, careerWins: 6,
    manager: 'Julian Jakobi', trainer: 'Mark Temple',
    languages: 'Spanish, English', helmetBrand: 'Schuberth',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2024/drivers/SERPER01.png'
  },
  'arvid_lindblad': {
    placeOfBirth: 'London, UK',
    height: '1.79 m', weight: '65 kg',
    firstRace: '2026 Bahrain Grand Prix',
    careerPodiums: 0, careerWins: 0,
    manager: 'Red Bull Academy', trainer: 'N/A',
    languages: 'English, Swedish', helmetBrand: 'Arai',
    imageUrl: 'https://media.formula1.com/content/dam/fom-website/drivers/2025/drivers/ARVLIN01.png'
  },
  'jack_doohan': {
    placeOfBirth: 'Gold Coast, Australia',
    height: '1.80 m', weight: '68 kg',
    firstRace: '2024 Abu Dhabi Grand Prix',
    careerPodiums: 0, careerWins: 0,
    manager: 'Flavio Briatore / Management', trainer: 'Alpine Staff',
    languages: 'English', helmetBrand: 'Bell',
    imageUrl: '/images/drivers/doohan.jpg'
  },
  'doohan': {
    placeOfBirth: 'Gold Coast, Australia',
    height: '1.80 m', weight: '68 kg',
    firstRace: '2024 Abu Dhabi Grand Prix',
    careerPodiums: 0, careerWins: 0,
    manager: 'Flavio Briatore / Management', trainer: 'Alpine Staff',
    languages: 'English', helmetBrand: 'Bell',
    imageUrl: '/images/drivers/doohan.jpg'
  }
};

// Merge into RICH_DRIVER_PROFILES
Object.assign(RICH_DRIVER_PROFILES, MORE_PROFILES);

async function seed() {
  console.log('Fetching 2026 driver list from Jolpi F1 API...');
  let apiDrivers = [];
  let teamMap = {}; // driverId -> team name from standings

  // Fetch driver-team mappings from standings
  try {
    const standingsRes = await fetch('https://api.jolpi.ca/ergast/f1/2026/driverStandings.json');
    if (standingsRes.ok) {
      const standingsData = await standingsRes.json();
      const standings = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
      standings.forEach(s => {
        teamMap[s.Driver.driverId] = s.Constructors[0]?.name || 'Unknown Team';
      });
      console.log(`Fetched team assignments for ${Object.keys(teamMap).length} drivers.`);
    }
  } catch (err) {
    console.warn('Could not fetch standings for team mapping:', err.message);
  }

  try {
    const res = await fetch('https://api.jolpi.ca/ergast/f1/2026/drivers.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    apiDrivers = data.MRData.DriverTable.Drivers;
    console.log(`Fetched ${apiDrivers.length} drivers successfully.`);
  } catch (err) {
    console.error('Failed to fetch from API, falling back to static roster:', err.message);
    apiDrivers = [
      { driverId: 'antonelli', permanentNumber: '12', code: 'ANT', url: '', givenName: 'Andrea Kimi', familyName: 'Antonelli', dateOfBirth: '2006-08-25', nationality: 'Italian' },
      { driverId: 'hamilton', permanentNumber: '44', code: 'HAM', url: '', givenName: 'Lewis', familyName: 'Hamilton', dateOfBirth: '1985-01-07', nationality: 'British' },
      { driverId: 'russell', permanentNumber: '63', code: 'RUS', url: '', givenName: 'George', familyName: 'Russell', dateOfBirth: '1998-02-15', nationality: 'British' },
      { driverId: 'leclerc', permanentNumber: '16', code: 'LEC', url: '', givenName: 'Charles', familyName: 'Leclerc', dateOfBirth: '1997-10-16', nationality: 'Monegasque' },
      { driverId: 'norris', permanentNumber: '4', code: 'NOR', url: '', givenName: 'Lando', familyName: 'Norris', dateOfBirth: '1999-11-13', nationality: 'British' },
      { driverId: 'piastri', permanentNumber: '81', code: 'PIA', url: '', givenName: 'Oscar', familyName: 'Piastri', dateOfBirth: '2001-04-06', nationality: 'Australian' },
      { driverId: 'max_verstappen', permanentNumber: '1', code: 'VER', url: '', givenName: 'Max', familyName: 'Verstappen', dateOfBirth: '1997-09-30', nationality: 'Dutch' },
      { driverId: 'gasly', permanentNumber: '10', code: 'GAS', url: '', givenName: 'Pierre', familyName: 'Gasly', dateOfBirth: '1996-02-07', nationality: 'French' },
      { driverId: 'hadjar', permanentNumber: '6', code: 'HAD', url: '', givenName: 'Isack', familyName: 'Hadjar', dateOfBirth: '2004-09-28', nationality: 'French' },
      { driverId: 'lawson', permanentNumber: '30', code: 'LAW', url: '', givenName: 'Liam', familyName: 'Lawson', dateOfBirth: '2002-02-11', nationality: 'New Zealander' }
    ];
  }

  // Override image URLs for specific drivers where local images were provided
  const localImages = {
    'perez': '/images/drivers/perez.jpg',
    'russell': '/images/drivers/russell.jpg',
    'colapinto': '/images/drivers/colapinto.jpg',
    'ocon': '/images/drivers/ocon.jpg',
    'albon': '/images/drivers/albon.jpg',
    'leclerc': '/images/drivers/leclerc.jpg',
    'sainz': '/images/drivers/sainz.jpg',
    'alonso': '/images/drivers/alonso.jpg',
    'hadjar': '/images/drivers/hadjar.jpg',
    'jack_doohan': '/images/drivers/doohan.jpg',
    'doohan': '/images/drivers/doohan.jpg',
    'antonelli': '/images/drivers/antonelli.jpg',
    'hamilton': '/images/drivers/hamilton.jpg',
    'stroll': '/images/drivers/stroll.jpg',
    'norris': '/images/drivers/norris.jpg',
    'lawson': '/images/drivers/lawson.jpg',
    'verstappen': '/images/drivers/verstappen.jpg',
    'max_verstappen': '/images/drivers/verstappen.jpg',
    'hulkenberg': '/images/drivers/hulkenberg.jpg',
    'bearman': '/images/drivers/bearman.jpg',
    'piastri': '/images/drivers/piastri.jpg',
    'bottas': '/images/drivers/bottas.jpg',
    'gasly': '/images/drivers/gasly.jpg'
  };

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
      // Priority: enriched profile team > standings API team > fallback
      const team = rich.team || teamMap[d.driverId] || 'Unknown Team';
      const finalImageUrl = localImages[d.driverId] || rich.imageUrl || `/images/drivers/placeholder.jpg`;

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
        team,
        rich.firstRace || 'N/A',
        rich.careerPodiums || 0,
        rich.careerWins || 0,
        rich.manager || 'N/A',
        rich.trainer || 'N/A',
        rich.languages || d.nationality,
        rich.helmetBrand || 'N/A',
        finalImageUrl
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

