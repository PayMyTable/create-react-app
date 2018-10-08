# yalc allows to use local node_modules with yarn
# https://medium.com/@mtfranchetto/the-solution-for-a-working-npm-yarn-link-ddcb4f3c785e

# List only the packages we modified, and wants to use as @paymytable-pmt
# For the others, we use the create-react-app ones.
#cd babel-plugin-named-asset-import && yalc publish && cd ..
cd babel-preset-react-app && yalc publish && cd ..
#cd confusing-browser-globals && yalc publish && cd ..
cd create-react-app && yalc publish && cd ..
#cd eslint-config-react-app && yalc publish && cd ..
#cd react-app-polyfill && yalc publish && cd ..
#cd react-dev-utils && yalc publish && cd ..
#cd react-error-overlay && yalc publish && cd ..
cd react-scripts && yalc publish && cd ..
