export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/futuropal',
    },
    neo4j: {
      uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
      user: process.env.NEO4J_USER || 'neo4j',
      password: process.env.NEO4J_PASSWORD || 'password',
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  huaweiCloud: {
    accessKeyId: process.env.HUAWEI_ACCESS_KEY_ID,
    secretAccessKey: process.env.HUAWEI_SECRET_ACCESS_KEY,
    region: process.env.HUAWEI_REGION || 'cn-north-4',
    projectId: process.env.HUAWEI_PROJECT_ID,
    endpoints: {
      iam: process.env.HUAWEI_IAM_ENDPOINT || 'https://iam.cn-north-4.myhuaweicloud.com',
      graphEngine: process.env.HUAWEI_GES_ENDPOINT || 'https://ges.cn-north-4.myhuaweicloud.com',
      obs: process.env.HUAWEI_OBS_ENDPOINT || 'https://obs.cn-north-4.myhuaweicloud.com',
      modelArts: process.env.HUAWEI_MODELARTS_ENDPOINT || 'https://modelarts.cn-north-4.myhuaweicloud.com',
    },
  },

  blockchain: {
    networks: {
      baseSepolia: {
        rpcUrl: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
        chainId: 84532,
        explorerUrl: 'https://sepolia.basescan.org',
      },
      ethereum: {
        rpcUrl: process.env.ETH_RPC || 'https://mainnet.infura.io/v3/YOUR_KEY',
        chainId: 1,
      },
      sui: {
        rpcUrl: process.env.SUI_RPC || 'https://fullnode.testnet.sui.io',
        chainId: 101,
      },
    },
    contracts: {
      sbt: process.env.SBT_CONTRACT_ADDRESS,
      nft: process.env.NFT_CONTRACT_ADDRESS,
      governance: process.env.GOVERNANCE_CONTRACT_ADDRESS,
    },
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
  },

  web3: {
    infuraApiKey: process.env.INFURA_API_KEY,
    alchemyApiKey: process.env.ALCHEMY_API_KEY,
    moralisApiKey: process.env.MORALIS_API_KEY,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },

  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@futuropal.com',
  },

  zkLogin: {
    providers: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      facebook: {
        appId: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET,
      },
    },
  },

  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
});
