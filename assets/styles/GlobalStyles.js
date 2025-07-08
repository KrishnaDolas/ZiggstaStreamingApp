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
  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 10,
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  getCurrentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  notificationDot: {
    position: 'absolute',
    top: 1,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
  },
});
