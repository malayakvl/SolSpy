import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default tseslint.config(
  {
    "files": ["resources/js/**/*.{js,jsx,ts,tsx}"],
    "ignores": ["public/build/**", "vendor/**"],
    "languageOptions": {
      "ecmaVersion": 2020,
      "sourceType": "module",
      "parserOptions": {
        "ecmaFeatures": {
          "jsx": true
        }
      }
    },
    "settings": {
      "react": {
        "version": "detect"
      }
    },
    "linterOptions": {
      "reportUnusedDisableDirectives": true
    },
    "plugins": {
      "react": react,
      "jsx-a11y": jsxA11y,
    },
    "rules": {
      "react/jsx-first-prop-new-line": [2, "multiline"],
      "react/jsx-max-props-per-line": [2, { "maximum": 1, "when": "multiline" }],
      "react/jsx-indent-props": [2, 2],
      "react/jsx-closing-bracket-location": [2, "tag-aligned"],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-console": "off",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error"
    }
  },
  {
    "files": ["resources/js/**/*.ts", "resources/js/**/*.tsx"],
    "languageOptions": {
      "parser": tseslint.parser,
      "parserOptions": {
        "project": "./tsconfig.json",
        "ecmaFeatures": {
          "jsx": true
        }
      }
    },
    "plugins": {
      "@typescript-eslint": tseslint.plugin,
    },
    "rules": {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
);