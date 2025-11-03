interface ConfigSettings {
  dbSettings: {
    connectionString: string;
    port: number;
  };
  jwtSettings: {
    secretKey: string;
  };
}

export const configSettings: ConfigSettings = {
  dbSettings: {
    connectionString:
      process.env.DATABASE_URL || 'supply your db connection string!',
    port: 5432,
  },
  jwtSettings: {
    secretKey: process.env.JWT_SECRET || 'supply your super secret key!',
  },
};
