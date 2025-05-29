import { StyleSheet, Platform } from 'react-native';
// This file contains the styles for the application, including light and dark themes.
export const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  themeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    fontSize: 14,
    marginTop: 10,
  },
  error: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  roomInfo: {
    marginTop: 30,
    alignItems: 'center',
  },
  roomText: {
    fontSize: 18,
    marginVertical: 5,
  },
  mainBox: {
    position: 'absolute',
    width: '100%',
    top: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streamBox: {
    width: '100%',
    position: 'relative',
  },
  fullScreenVideo: {
    width: '100%',
    height: 600,
    backgroundColor: '#000',
    borderRadius: 12,
    marginBottom: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 10,
  },
  streamControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  startStreamingButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 5,
    width: '45%',
    alignItems: 'center',
  },
  stopStreamingButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 5,
    width: '45%',
    alignItems: 'center',
  },
  streamingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  viewingText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  leaveButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  lobbyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 15,
    textAlign: 'center',
  },
  roomList: {
    width: '100%',
    marginBottom: 20,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  joinButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  //Splash Screen Styles
  SplashScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: '100%',
    width: '100%',
  },
  splashImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  splashButton: {
    position:'absolute',
    bottom: '40',
    flex:'1',
    alignItems: 'center',
    paddingVertical: 12, // Top & Bottom
    paddingHorizontal: 30, // Left & Right
    borderRadius: 30,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    fontFamily:'sans-serif',
    fontSize: 22,
    border: 'none',
  },
  splashButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  //Footer Styles
footer: {
  position: 'fixed',
  bottom: '0%',
  left: 0,
  right: 0,
  backgroundColor: 'white',  // white background
  paddingVertical: 10,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#ddd', // optional: a light border color
},

  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#fff',
  },

//Registragon Form Styles
  carousel: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  slide: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qAWrapper: {
    width: '100%',
    height: '50%',
    padding: 20,
  },
  question: {
    fontSize: 20,
    marginTop: 60,
    textAlign: 'center',
  },
  answer: {
    width: '100%',
    marginTop: 20,
    padding: 10,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  btnNav: {
    width: 120,
    height: 40,
    fontSize: 16,
    fontWeight: '300',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#be0069',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 160,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: '#be0069',
    shadowColor: '#be0069',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },
  btnGenderWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 40,
  },
  btnGender: {
    backgroundColor: '#be0069',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    margin: 5,
    color: 'white',
  },
  btnGenderActive: {
    backgroundColor: 'rgba(190, 0, 105, 0.4)',
  },
  btnInterestsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 40,
    gap: 20,
  },
  btnInterest: {
    backgroundColor: '#be0069',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 5,
  },
  btnInterestActive: {
    backgroundColor: 'rgba(190, 0, 105, 0.4)',
  },
});

// Theme Styles
export const themeStyles = {
  light: {
    container: { backgroundColor: '#f0f4f8' },
    formContainer: { backgroundColor: '#fff' },
    text: { color: '#333' },
    input: { borderColor: '#ddd', backgroundColor: '#fff', color: 'black' },
    button: { backgroundColor: '#1a73e8' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: 'red' },
    success: { color: 'green' },
    primary: { color: '#1a73e8' },
    placeholder: { color: '#999' },
    roomItem: { backgroundColor: '#f5f5f5' },
    splashButtonText: { color: 'white' },
},
  dark: {
    container: { backgroundColor: '#121212' },
    formContainer: { backgroundColor: '#1e1e1e' },
    text: { color: '#fff' },
    input: { borderColor: '#444', backgroundColor: '#2a2a2a', color: 'white' },
    button: { backgroundColor: '#1a73e8' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: '#ff5555' },
    success: { color: '#55ff55' },
    primary: { color: '#1a73e8' },
    placeholder: { color: '#aaa' },
    roomItem: { backgroundColor: '#2a2a2a' },
    splashButtonText: {color: 'black'},
  }
}