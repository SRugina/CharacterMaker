module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./service-worker/build-scripts/tsconfig.json",
    ],
  },
  extends: [
    "@remix-run/eslint-config",
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "no-undef": "off",
      },
    },
  ],
  rules: {
    "react/react-in-jsx-scope": 0,
    "react/display-name": 0,
    "react/prop-types": 0,
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-dupe-class-members": ["error"],
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": ["error"],
    "@typescript-eslint/ban-ts-comment": [
      "error",
      { "ts-ignore": "allow-with-description" },
    ],
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/member-delimiter-style": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-unused-vars": [
      2,
      {
        argsIgnorePattern: "^_",
      },
    ],
    "no-console": [
      2,
      {
        allow: ["log", "warn", "error"],
      },
    ],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
