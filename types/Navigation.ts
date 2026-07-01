import { Loan } from './Loan';

export type RootStackParamList = {
  'Pay Screen': undefined;
  'Invest Screen': undefined;
  'Create Account': undefined;
  Settings: undefined;
  'Loan History': undefined;
  'Loan Detail': { loan: Loan };
};
