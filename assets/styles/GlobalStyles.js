import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  textRegular: {
    fontFamily: 'SFUIDisplay-Regular',
    fontSize: 16,
  },
  textBold: {
    fontFamily: 'SFUIDisplay-Bold',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eaeaeb', // --light-medium-gray
    borderRadius: 21,
    backgroundColor: '#f7f7f7', // --very-light-gray
    color: '#414141',
    fontFamily: 'SFUIDisplay-Light', // Match the font PostScript name
    fontSize: 16,
    fontWeight: '500',
    padding: 10,
    height: 42,
    boxSizing: 'border-box', // Not needed in React Native but kept for reference
  },
  errorText: {
    fontSize: 14,
    color: '#dc3131',
    marginTop: 5,
  },
});
