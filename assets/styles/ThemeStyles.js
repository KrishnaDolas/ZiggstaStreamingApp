import { StyleSheet, Platform } from 'react-native';
import { Dimensions } from 'react-native';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Calculate item width
const giftCardItemWidth = (screenWidth - (31 * (4 + 1))) / 4;

// This file contains the styles for the application, including light and dark themes.
export const styles = StyleSheet.create({
  container: {
    padding: 0,
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
    height: '100%',
    position: 'relative',
    borderRadius: 12,
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
  SingInlabel: {
    fontSize: 16,
    // marginBottom: 0,
    float: 'left',
  },
  Loginerror: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  Othersinginoption: {
    flexDirection: 'row',
    position: 'relative',
    left: '25%',
    width: '100%',
    marginTop: 80,
    marginBottom: 50,
  },
  Loginoptionbtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  Loginoption: {
    marginVertical: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    gap: 25,
  },
  Applebtn: {
    backgroundColor: '#000000',
  },
  Googlebtn: {
    backgroundColor: '#fa1500',
  },
  Facebookbtn: {
    backgroundColor: '#377aff',
  },
  formTitle: {
    textAlign: 'center',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    width: '98%',
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    // paddingHorizontal: 30,
    borderRadius: 20,
    marginVertical: 10,
    width: '95%',
    marginHorizontal: 10,
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
  // roomInfo: {
  //   alignItems: 'center',
  // },
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
  StreamLoader: {
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000033',
  },
  streamBox: {
    width: '100%',
    position: 'relative',
    height: '100%',
    backgroundColor: '#1d1d1d',
  },

  fullScreenVideo: {
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 12,
    marginBottom: 15,
  },
  streamVideosContainer: {
    width: '100%',
    height: screenHeight * 0.5 + 40,
    overflow: 'hidden',
  },
  streamVideosInnerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    // justifyContent: 'center', // optional: space-around, space-evenly
  },
  streamVideo: {
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    position: 'relative',
    // flex: 1,
    width: '100%',
    height: '100%',
  },

  videoOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    zIndex: 10,
  },

  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 99
  },

  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 3,
  },

  friendRequestIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // stream third row 
  threeUserRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },

  threeUserColumnLeft: {
    width: '50%',
    height: '100%',
  },

  threeUserColumnRight: {
    width: '50%',
    height: '100%',
    flexDirection: 'column',
  },

  streamVideoFull: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },

  streamVideoHalf: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  videoText: {
    color: '#fff',
    fontSize: 22,
  },

  // stream 5 th row

  fiveUserWrapper: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },

  fiveUserRow: {
    flexDirection: 'row',
    width: '100%',
    height: '50%', // two rows, so 50% each
  },

  fiveUserCol50: {
    width: '50%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },

  fiveUserCol33: {
    width: '33.33%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  streamFiveUserVideo: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  strMuteOffIconBoxOverlay: {
    position: 'absolute',
    height: screenHeight * 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 1,
    zIndex: 1100,
  },
  controls: {
    position: 'absolute',
    height: screenHeight * 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: screenWidth * 1,
    // paddingVertical: 10,
    // backgroundColor: 'transparent',
    zIndex: 1000,
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
    position: 'absolute',
    bottom: '60',
    flex: '1',
    alignItems: 'center',
    paddingVertical: 12, // Top & Bottom
    paddingHorizontal: 30, // Left & Right
    borderRadius: 30,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    fontFamily: 'sans-serif',
    fontSize: 22,
    border: 'none',
  },
  splashButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  //Footer Styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',  // white background
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
  },

  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
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
    flex: 1,
    paddingTop: 20,
  },
  question: {
    fontSize: 20,
    marginTop: 60,
    textAlign: 'center',
    marginBottom: 30,
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
    marginBottom: 45,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10, // Add some padding from screen edges
    marginTop: 10,
  },
  btnGender: {
    backgroundColor: '#be0069',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginVertical: 5,
    color: 'white',
    width: '48%', // Each button takes 48% width with 4% total gap
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGenderActive: {
    backgroundColor: 'rgba(190, 0, 105, 0.4)',
  },
  btnInterestsWrapper: {
    marginTop: 40,
  },
  btnInterest: {
    backgroundColor: '#be0069',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 5,
  },
  btnInterestActive: {
    backgroundColor: '#d93a63',
  },



  // profile style start

  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    zIndex: 10,
  },

  profileScrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    flex: 1,
  },

  profileContainer: {
    paddingHorizontal: 18,
  },
  profileBlockLeftBox: {
    flexDirection: 'row',
    flex: 1.1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileBlockRightBox: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center',
    paddingLeft: 10,
  },
  profileBlock: {
    flex: 1,
    alignItems: 'center',
  },

  profileHeaderLogo: {
    width: 45,
    height: 45,
  },

  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.46,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#fff',
  },

  profileMainText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },

  profileValueText: {
    fontSize: 16,
    fontWeight: '500',
  },

  profileStatCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  profileStatCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.46,
    shadowRadius: 5,
    elevation: 5,
  },

  profileStatLabel: {
    fontSize: 14,
    marginBottom: 10,
  },

  profileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  profileTable: {
    borderRadius: 12,
    marginBottom: 24,
    borderColor: '#d9d9d9',
    borderWidth: 0.3,
    overflow: 'hidden',
  },

  profileTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 10,
  },

  profileTableHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },

  profileTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  profileTableCell: {
    textAlign: 'center',
  },

  profileTableCellIndex: {
    flex: 0.5,
    paddingRight: 5,
  },
  profileTableCellUsername: {
    flex: 2,
    textAlign: 'left', // Align username to left
    paddingLeft: 8,
  },
  profileTableCellAmount: {
    flex: 1,
    textAlign: 'right', // Align amount to right
    paddingRight: 15,
  },

  profileButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 60,
  },

  profileActionBtnBox: {
    width: '48%',
    paddingHorizontal: 15,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'start',
    // flexDirection: 'c',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },

  profileActionButton: {
    paddingHorizontal: 10,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'start',
    // flexDirection: 'c',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },

  profileActionButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'start',
    marginTop: 4,
  },

  profileErrorBoxMain: {
    padding: 12,
    borderRadius: 8,
  },

  profileErrorText: {
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // profile style end

  // profile modal

  profileModalMain: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  profileModalOverlay: {
    // backgroundColor: 'white',
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Android
    elevation: 10, // increased for deeper shadow

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.4, // stronger
    shadowOffset: { width: 0, height: -6 }, // shadow upwards
    shadowRadius: 12, // softer and more spread

    zIndex: 10, // ensure it's above other content
  },
  profileModalClose: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },

  profileMSocialBox: {
    marginTop: 10,
    marginBottom: 20,
  },

  profileMSocialBoxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 30,
    paddingHorizontal: 15,
    // marginBottom: 10,
    paddingVertical: 10,
  },

  profileMSocialBoxItemIcon: {
    marginRight: 14,
  },

  profileMSocialBoxItemInput: {
    flex: 1,
    height: 40,
    borderColor: '#a5a5a5',
    borderWidth: 0.4,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    color: '#414141',
    paddingHorizontal: 13,
    fontSize: 15,
  },

  profileSettingModalBody: {
    marginHorizontal: 15,
  },

  profileSettingMDarkLightSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  pSettingMDarkLightSTitle: {
    fontSize: 16,
    fontWeight: '400',
  },

  pSettingMDarkLightSIconBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  pSettingMDarkLightSIconBox: {
    height: 38,
    width: 38,
    borderRadius: 30,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileSettingMDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 2,
  },

  profileSettingMMenuList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 17,
    borderColor: '#eee',
  },

  profileSettingMMenuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopManagerDetailsModalMain: {
    marginHorizontal: 15,
  },
  modalDarkTitle: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },

  // profile modal


  // stream list header

  streamListHeader: {
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 2,
    zIndex: 10,
    width: '100%',
  },

  streamListHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  streamHeaderLeftImg: {
    width: 140,
    height: 40,
  },

  streamHeaderRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamHeaderCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 12,
    backgroundColor: '#d93a63',
    borderRadius: 30,
    // padding: 5,
    paddingLeft: 8,
    paddingRight: 5,
    paddingVertical: 3,
    minWidth: 65,
  },

  streamHeaderCountTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 10,
    paddingEnd: 10,
  },

  streamListHeaderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 10,
    // paddingVertical: 6,
  },

  strHeaderFixedIcon: {
    paddingHorizontal: 8,
  },

  strHeaderScrollCategoryContainer: {
    paddingHorizontal: 4,
    // paddingBottom: 3,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  strHeaderCategoryButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginHorizontal: 5,
    // Shadow for iOS
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Shadow for Android
    elevation: 3,
  },

  strHeaderCategoryText: {
    fontSize: 18,
    fontWeight: '600',
  },
  btnInterestActiveText: {
    color: '#fff',
  },

  streamListMainCardLayout: {
    flex: 1,
    paddingBottom: 10,
  },

  streamListMainTitle: {
    // flex: 1,
    // paddingBottom: 140,
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  streamListScrollContainer: {
    paddingTop: 10,
    paddingBottom: 80,
    paddingHorizontal: 10,
    borderTopColor: '#1e1e1e',
    borderTopWidth: 0.6,
  },

  streamListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // marginTop: 10,
    // marginBottom: 80
  },
  streamListCard: {
    width: '48%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#ddd',
    position: 'relative',
  },
  streamListImage: {
    width: '100%',
    // height: 190,
  },
  streamListEyeCountContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamListEyeCount: {
    fontSize: 12,
    marginEnd: 10,
  },
  streamListOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 9,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60, // adjust based on how much fade you want
    zIndex: 1,
  },
  streamListName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    maxWidth: '100%',
  },
  streamListStatus: {
    fontSize: 12,
    color: '#fff',
    maxWidth: '100%',
  },
  streamListFiltersBtnGroup: {
    position: 'absolute',
    bottom: '8.2%',
    left: '50%',
    transform: [{ translateX: -0.475 * screenWidth }],
    flexDirection: 'column',
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  streamListFiltersWhiteBtn: {
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Android shadow
    elevation: 5,
  },

  streamListFiltersColorBtn: {
    backgroundColor: '#de0037',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 7,

    // Shadow for Android
    elevation: 4,
    marginBottom: 10,
  },

  streamListFiltersColorBtnText: {
    color: '#fff',
    fontSize: 15,
  },

  strHedSearchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.09)',
    justifyContent: 'start',
    alignItems: 'center',
  },
  strHedSearchModalCard: {
    width: '90%',
    top: '20%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    // flexDirection: 'row',
    // alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  strHedSearchModalCloseBtn: {
    backgroundColor: '#cc0461',
    borderRadius: 20,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  strHedSearchModalTopForm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },


  strHedSearchModalForm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },

  strHedSearchModalInput: {
    // flex: 1,
    backgroundColor: '#f7f7f7',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    borderColor: '#eaeaeb',
    borderWidth: 1,
    color: '#414141',
    fontWeight: '300',
    fontSize: 15,
  },
  strHedSearchModalFormBtnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 10,
  },
  strHedSearchModalSearchBtn: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,

  },

  strHedSearchTabBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  strHedSearchTabAction: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 30,
    backgroundColor: '#ebebeb',
    marginRight: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Shadow for Android
    elevation: 3,
  },

  strHedSearchTabActionText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },

  isFilteringOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },


  isFilteringBlurBackground: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0, 0, 0, 0.23)', // subtle blur feel using transparency
    zIndex: -1,
  },

  // modal css start

  centerModalOverlay: {
    flex: 1,
    backgroundColor: '#00000033',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerModalCard: {
    width: '97%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    position: 'relative',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 5,
    // elevation: 10
  },

  modalCloseBtn: {
    zIndex: 10,
  },
  modalSmallTitle: {
    fontSize: 18,
    // color: '#000',
    marginBottom: 20,
  },
  modalLargeTitle: {
    fontSize: 28,
    color: '#000',
    marginBottom: 20,
  },

  modalButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  modalCommonButton: {
    width: '48.5%',
    paddingVertical: 13,
    borderRadius: 6,
    backgroundColor: '#be0069',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCommonButtonText: {
    color: '#fff',
    fontSize: 15,
  },

  fullScreenModalOverlay: {
    padding: 10,
  },

  fullScreenModalMain: {
    justifyContent: 'start',
    margin: 0,
  },

  halfScreenModalOverlay: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: 'white',
    padding: 10,
  },

  halfScreenModalMain: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  modalCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  modalCategoryButton: {
    backgroundColor: 'rgba(184, 58, 243, 1)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalCategoryButtonActive: {
    backgroundColor: '#6a0dad',
  },
  modalCategoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // modal css end

  // room input modal

  roomInputModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.09)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInputModalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },

  // activity indicator

  activityIndicatorMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // message list
  messageListGradientBox: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  messageListSafeView: {
    flex: 1,
    position: 'relative',
    paddingBottom: 60,
  },
  messageListMainCardLayout: {
    flex: 1,
    paddingBottom: 10,
  },
  messageListLayout: {
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  messageListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  messageListAvatar: {
    width: 50,
    height: 50,
    borderRadius: 24,
    marginRight: 15,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  messageListContent: {
    flex: 1,
  },
  messageListName: {
    fontWeight: '500',
    fontSize: 15,
    marginBottom: 2,
    maxWidth: '90%',
  },
  meListMessage: {
    fontSize: 13,
    maxWidth: '92%',
  },
  messageListTime: {
    fontSize: 12,
  },
  frActionBox: {
    flexDirection: 'row',
    gap: 5,
  },
  frActionConfirmBtn: {
    backgroundColor: '#d93a63',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  frActionBtnText: {
    fontWeight: '500',
    fontSize: 14,
  },
  frActionDeleteBtn: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  flUserModalBtn: {
    height: 30,
    width: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  messListFilterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 10,
    // gap: 10,
    // flexWrap: 'wrap',
  },
  messListFilterTabBTn: {
    paddingVertical: 6,
    borderRadius: 4,
    paddingHorizontal: 8, // Reduced from 10
    flex: 1,
    // maxWidth: '32%', // Ensures buttons don't exceed screen width
  },
  // stream room

  strRoomHeader: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingTop: 8,
  },
  strRoomHeaderLeft: {
    flexDirection: 'row',
    backgroundColor: 'rgba(36, 32, 32, 0.75)',
    padding: 4,
    borderRadius: 30,
    borderColor: '#242020',
    borderWidth: 1,
    minWidth: 120
  },

  strRoomHeaderLeftProfileImg: {
    width: 35,
    height: 35,
    borderRadius: 24,
    marginRight: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  strRoomHeaderLeftProfileName: {
    color: '#fff',
    marginRight: 10,
    fontSize: 12,
  },
  strRoomHeaderLeftProfileSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strRoomHeaderLeftProfileSubText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },

  strRoomHeaderRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  strRoomHeaderRWalletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(36, 32, 32, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 30,
    borderColor: '#242020',
    borderWidth: 1,
  },
  strRoomHeaderRWalletInfoText: {
    color: '#ffea23',
    marginLeft: 5,
    paddingHorizontal:5
  },
  strRoomHeaderRIconBox: {
    marginLeft: 18,
  },
  strLiveStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  strTitle: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: '600',
  },
  streamViewerCount: {
    position: 'relative',
    right: 17,
    bottom: 19,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  streamViewerCountTitle: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  strRoomFooter: {
    width: '100%',
    position: 'relative',
    // paddingBottom: 20,
    paddingVertical: 20,
  },
  strRoomFooterChatOrActionsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 18,
  },
  streamChatContainer: {
    flex: 1,
    height: 215,
    position: "relative",
    bottom: 25
  },
  streamChatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streamChatItemProfileImg: {
    width: 37,
    height: 37,
    borderRadius: 24,
    marginRight: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  streamChatMessageBox: {
    marginLeft: 6,
  },
  streamChatUserName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFF33',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  streamChatMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  strRoomFooterSocialActions: {
    position: 'absolute',
    bottom: 18,
    right: 8,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
  },
  strRoomFooterSocialActionsBtn: {
    marginBottom: 24,
  },
  strRoomBottomBox: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 14,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strRoomBottomBoxInput: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    height: 40,
    borderRadius: 25,
    paddingHorizontal: 16,
    borderColor: '#eaeaeb',
    borderWidth: 1,
    color: '#414141',
    fontWeight: '300',
    fontSize: 15,
  },
  strRoomBottomBoxIconBox: {
    marginLeft: 20,
  },

  // gift modal
  giftModalCategoryMainLayout: {
    backgroundColor: '#fff',
    paddingVertical: 13,
    paddingHorizontal: 15,
    overflow: 'hidden',
    borderRadius: 8,
    marginTop: 10,
    position: 'relative',
  },
  giftModalCatRightArrow: {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 4,
    zIndex: 10,
  },
  giftModalCategoryContainer: {
    flexDirection: 'row',
    paddingBottom: 5,
  },
  giftModalCatTab: {
    backgroundColor: '#ebebeb',
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 7,
    marginRight: 20,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Android shadow
    elevation: 3,
  },
  giftModalCatTabActive: {
    backgroundColor: '#d93a63',
  },
  giftModalCatTabText: {
    color: '#232323',
    fontSize: 16,
    fontWeight: '500',
  },
  giftModalCatTabActiveText: {
    color: '#fff',
  },
  giftModalItemsMainLayout: {
    backgroundColor: '#fff',
    marginTop: 0,
    borderRadius: 8,
    height: 200,
    marginHorizontal: 7,
    borderColor: '#d9d9d9',
    borderWidth: 1,
  },
  giftModalCategoryItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  giftModalCatItem: {
    width: giftCardItemWidth, // 4 items in a row with some spacing
    aspectRatio: 1, // keeps it square (optional)
    alignItems: 'center',
    marginBottom: 20,
    marginRight: 18,
  },
  giftModalCatItemImage: {
    height: '100%',
    width: '100%',
    borderRadius: 6,
    backgroundColor: 'white',
    zIndex: 1,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 2,
  },
  noGiftsTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGiftsTextContent: {
    color: '#fff',
    fontSize: 15,
  },


  // stream more setting options
  strMoreSettingListContainer: {
    position: 'absolute',
    bottom: 70,
    right: '14%',
  },
  strMoreSettingListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  strMoreSettingListItemText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 14,
    fontWeight: '600',
  },

  // wallet dashboard screen

  wdTabContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
    padding: 7,
  },
  wdTabButton: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 7,
  },
  wdActiveTab: {
    borderWidth: 2,
  },
  wdTabText: {
    // color: '#333',
    fontWeight: '600',
  },
  wdActiveTabText: {
    color: '#000',
  },
  wdAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 10,
  },
  wdAmountButton: {
    // width: 60,
    // padding: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
    // backgroundColor: '#e6f0ff',
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  wdAmountSelected: {
    // backgroundColor: '#004080',
    borderWidth: 2,
    // borderColor: '#007bff',
  },
  wdAmountText: {
    // color: '#004080',
    fontWeight: '500',
  },
  wdAmountTextSelected: {
    // color: '#fff',
    fontWeight: 'bold',
  },
  wDFormContainer: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 10,
    position: 'relative',
  },
  wdPickerWrapper: {
    backgroundColor: '#f7f7f7',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingLeft: 4,
  },
  wdDropdown: {
    height: 52,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: '#f7f7f7',
    color: '#414141',
  },
  wdPicker: {
    height: 52,
    width: '100%',
    color: '#414141', // text color (selected item)
    backgroundColor: Platform.OS === 'android' ? '#f7f7f7' : 'transparent',
  },
  wdFormError: {
    color: '#dc3131',
    paddingTop: 5,
    paddingLeft: 4,
  },
  wdFormSuccess: {
    color: 'green',
    paddingTop: 5,
    paddingLeft: 4,
  },
  wdFormGradientButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginVertical: 12,
    width: '100%',
    // height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },

  wdFormButtonOverlay: {
    borderRadius: 30,
    alignItems: 'center',
  },
  wdFormSubmitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  wdFormInfoText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  wdInput: {
    borderRadius: 24,
    padding: 12,
    width: '100%',
    marginVertical: 10,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
    borderColor: '#eaeaeb',
    borderWidth: 1,
  },
  wDReferralStatsContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  wDReferralStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  wdRefStateCard: {
    // backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
    // Box shadow equivalent
    // shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Required for Android
  },
  wdRefStateTitle: {
    fontSize: 14,
    // color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  wdRefStateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    // color: '#222',
    textAlign: 'center',
  },
  wdFriendsDropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    height: 160,
    width: '100%',
    left: 18,
    right: 0,
    overflow: 'scroll',
    zIndex: 10,
    position: 'absolute',
    top: 100, // Adjust based on your layout
  },

  wdFriendItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  wdFriendItemText: {
    fontSize: 16,
    color: '#333',
  },

  // profile sub setting modal
  mySettingSubModalTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  mySettingSubModalClose: {
    width: 60,
    paddingLeft: 8,
  },
  mySettingSubModalTitle: {
    fontSize: 24,
    color: '#d93a63',
  },

  // bank details modal
  bdLabel: {
    fontSize: 14,
    // color: '#717580',
    fontWeight: 500,
    marginBottom: 5,
  },
  bdPickerWrapper: {
    backgroundColor: '#f7f7f7',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eaeaeb',
    paddingLeft: 4,
    marginBottom: 15,
  },
  bdPicker: {
    height: 52,
    width: '100%',
    color: '#414141', // text color (selected item)
    backgroundColor: Platform.OS === 'android' ? '#f7f7f7' : 'transparent',
  },
  bdInput: {
    borderRadius: 20,
    backgroundColor: '#f7f7f7',
    borderColor: '#eaeaeb',
    borderWidth: 1,
    padding: 12,
    width: '100%',
    fontSize: 15,
    marginBottom: 10,
    color: '#414141',
  },

  // profile screen modal main

  psmHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  psmReportButton: {
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  psmReportButtonText: {
    color: '#004080',
    fontSize: 14,
    fontWeight: '600',
  },
  psmProfileContainer: {
    // flex: 1,
    // alignItems: 'center',
    marginHorizontal: 10,
  },
  psmProfileTopCard: {
    alignItems: 'center',
    // paddingHorizontal: 20,
    // backgroundColor: '#fff', // required for Android elevation
    borderRadius: 10,
    paddingTop: 140,
    borderTopWidth: 0, // helps avoid shadow overlap on top
    position: 'relative',
  },

  psmProfileImageContainer: {
    width: screenWidth,
    // backgroundColor: '#fff',
    position: 'absolute',
    top: -10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingVertical: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d93a63',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  psmProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  psmProfileName: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: '#333',
    marginBottom: 5,
  },
  psmProfileId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  psmStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderRadius: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // marginBottom: 40,
  },
  psmStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  psmStatLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  psmStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d93a63',
  },
  psmSocialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 40,
  },
  psmSocialButton: {
    padding: 5,
  },
  psmInstagramIcon: {
    width: 50,
    height: 50,
    // borderRadius: 25,
    // backgroundColor: '#E4405F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  psmFacebookIcon: {
    width: 50,
    height: 50,
    // borderRadius: 25,
    // backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  psmTwitterIcon: {
    width: 50,
    height: 50,
    // borderRadius: 25,
    // backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  psmSocialIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Top Gifters Container
  psmTopGiftersContainer: {
    paddingVertical: 15,
  },

  // Title
  psmTopGiftersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d93a63',
    marginBottom: 15,
  },

  // Main Top Gifter Card
  psmTopGifterMainCard: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    alignItems: 'center',
    // marginBottom: 15,
    minHeight: 120,
    position: 'relative',
    // For React Native, use a solid color or implement gradient library
  },

  // Top Gifter Image Container
  psmTopGifterImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Top Gifter Main Image
  psmTopGifterMainImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },

  // Top Gifter Name
  psmTopGifterMainName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Top Gifter Amount
  psmTopGifterMainAmount: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
  },

  // Other Gifters Container
  psmOtherGiftersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Other Gifter Card
  psmOtherGifterCard: {
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },

  // Other Gifter Image Container
  psmOtherGifterImageContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Other Gifter Image
  psmOtherGifterImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Other Gifter Name
  psmOtherGifterName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    maxWidth: '60%',
  },

  // Other Gifter Amount
  psmOtherGifterAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 5,
    maxWidth: '40%',
  },

  // report modal

  reportLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#0f0f0f',
  },
  reportLoadingText: {
    color: '#fff',
    fontSize: 16,
  },
  reportUserInfoCard: {
    borderRadius: 16,
    paddingTop: 10,
    marginBottom: 24,
  },
  reportUserInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportUserDetails: {
    flex: 1,
  },
  reportUserName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d93a63',
  },
  reportCategoriesSection: {
    marginBottom: 24,
  },
  reportSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reportCategoriesContainer: {
    gap: 12,
  },
  reportCategoryCard: {
    borderRadius: 30,
    padding: 16,
  },
  reportSelectedCategoryCard: {
    backgroundColor: '#ff4757',
    borderColor: '#ff4757',
  },
  reportCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportCategoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  reportSelectedCategoryTitle: {
    color: '#fff',
  },
  reportCategoryIconContainer: {
    marginLeft: 12,
  },
  reportSubCategoriesContainer: {
    marginBottom: 24,
  },
  reportSubCategoryHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reportSubCategoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  reportSubCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportRadioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d93a63',
  },
  reportSubCategoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  reportDescriptionSection: {
    marginBottom: 32,
  },
  reportDescriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    // color: '#fff',
    marginBottom: 12,
  },
  reportDescriptionInput: {
    // backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    // color: '#fff',
    minHeight: 120,
  },
  reportSubmitSection: {
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportSubmitButton: {
    backgroundColor: '#d93a63',
    borderRadius: 30,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportSubmitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reportSubmitIcon: {
    marginLeft: 4,
  },
  // google ad
  googleAdContainer: {
    alignItems: 'center',
    marginTop: 5,
    // backgroundColor: '#000',
    width: '100%',
  },
  googleAdBanner: {
    width: 320,
    height: 50,
  },

  // leader board
  leaderBoardContainer: {
    flex: 1,
  },
  leaderBoardHeader: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  leaderBoardFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leaderBoardFilterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    // backgroundColor: '#fff',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    // borderBottomColor: '#333',
  },
  leaderBoardActiveFilter: {
    borderBottomColor: '#d93a63',
    borderBottomWidth: 2,
  },
  leaderBoardFilterText: {
    fontSize: 12,
    fontWeight: '600',
    // color: '#000',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  leaderBoardActiveFilterText: {
    color: '#d93a63',
    fontWeight: '800',
  },
  leaderBoardListContainer: {
    paddingHorizontal: 0,
    paddingBottom: 120,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    // backgroundColor: '#fff',
    borderBottomWidth: 1,
    // borderBottomColor: '#d9d9d9',
  },
  lbRankBadge: {
    width: 33,
    height: 33,
    // borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  lbRankText: {
    fontSize: 14,
    fontWeight: '500',
    // color: '#000',
  },

  lbSparkleContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  lbSparkle: {
    fontSize: 12,
  },
  lbAvatarSection: {
    position: 'relative',
    marginRight: 12,
  },
  lbAvatarContainer: {
    position: 'relative',
  },
  lbTopThreeAvatar: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lbAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  lbCrownContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  lbCrown: {
    fontSize: 20,
  },
  lbLiveIndicator: {
    position: 'absolute',
    bottom: -5,
    left: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  lbLiveText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lbUserInfo: {
    flex: 1,
    marginRight: 12,
  },
  lbUsername: {
    fontSize: 14,
    fontWeight: '600',
    // color: '#000',
    letterSpacing: 0.3,
  },
  lbLocation: {
    fontSize: 12,
    // color: '#999',
    fontWeight: '400',
    marginBottom: 3,
  },
  lbAmountSection: {
    marginRight: 12,
  },
  lbDiamondBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d93a63',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    shadowColor: '#d93a63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    alignSelf: 'flex-start',
  },
  lbAmountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginLeft: 4,
    flexShrink: 1,
  },
  lbStarButton: {
    width: 29,
    height: 29,
    borderRadius: 22,
    // backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    // borderColor: '#bdbdbdff',
  },

});

// Theme Styles
export const themeStyles = {
  light: {
    // splash screen
    SplashScreen: {
      backgroundColor: '#fff',
    },
    // common styles
    container: { backgroundColor: '#f0f4f8' },
    formContainer: { backgroundColor: '#fff' },
    text: { color: '#333' },
    input: { borderColor: '#eaeaeb', backgroundColor: '#f7f7f7', color: 'rgb(65, 65, 65)' },
    button: { color: 'white' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: 'red' },
    success: { color: 'green' },
    primary: { color: '#1a73e8' },
    placeholder: { color: '#999' },
    roomItem: { backgroundColor: '#f5f5f5' },
    splashButtonText: { color: 'white' },
    SingInlabel: { color: '#717580' },
    question: {
      color: '#000',
    },
    // modal css
    profileModalOverlay: {
      backgroundColor: 'white',
    },
    psmProfileTopCard: {
      backgroundColor: '#fff',
      // iOS Shadow
      shadowColor: '#d9d9d9',
      shadowOffset: {
        width: 0,
        height: 20, // maps to second value in CSS (vertical offset)
      },
      shadowOpacity: 0.08, // similar to rgba alpha
      shadowRadius: 20, // blur radius like the 3rd value in CSS

      // Android Shadow
      elevation: 10, // approximate effect, tweak as needed
    },
    psmProfileImageContainer: {
      backgroundColor: '#fff',
    },
    psmTopGiftersContainer: {
      backgroundColor: '#fff',
    },
    psmProfileName: {
      color: '#333',
    },
    pSettingMDarkLightSTitle: {
      color: '#232323',
    },
    fullScreenModalOverlay: {
      backgroundColor: 'white',
    },
    modalSmallTitle: {
      color: '#000',
    },

    // profile css

    profileErrorBoxMain: {
      backgroundColor: '#fff',
    },
    profileHeader: {
      backgroundColor: '#fafafa',
    },
    profileScrollContainer: {
      backgroundColor: '#fff',
    },
    profileMainText: {
      color: '#d93a63',
    },
    profileValueText: {
      color: '#202329',
    },
    profileStatCard: {
      backgroundColor: '#fff',
    },
    profileStatLabel: {
      color: 'rgb(136, 136, 136)',
    },
    profileStatValue: {
      color: '#d93a63',
    },
    profileTableHeader: {
      backgroundColor: '#f0f0f0',
    },
    profileTable: {
      backgroundColor: '#f9fafb',
    },
    profileTableHeaderText: {
      color: '#1f2937',
    },
    profileTableCell: {
      color: '#374151',
    },
    profileTableRow: {
      backgroundColor: '#fff',
    },
    profileActionButtonText: {
      color: '#000',
    },
    profileActionBtnBox: {
      backgroundColor: '#fff',
    },
    // stream list
    streamListHeader: {
      backgroundColor: '#fff',
    },
    strHeaderCategoryButton: {
      backgroundColor: '#ebebeb',
      shadowColor: '#000',
    },
    strHeaderCategoryText: {
      color: '#232323',
    },
    streamListMainTitle: {
      color: '#262628',
      // backgroundColor: "#fff"
    },
    streamListMainCardLayout: {
      backgroundColor: '#fff',
    },
    isFilteringBlurBackground: {
      backgroundColor: 'rgba(0, 0, 0, 0.23)', // subtle blur feel using transparency
    },

    streamListEyeCountContainer: {
      backgroundColor: '#575757b3',
      borderColor: '#fff',
    },
    streamListEyeCount: {
      color: '#fff',
    },
    streamListName: {
      color: '#fff',
    },
    // message list

    messageListMainCardLayout: {
      backgroundColor: '#fff',
    },
    messageListContainer: {
      backgroundColor: '#fcfcfc',
      borderBottomColor: '#d9d9d9',
    },
    messageListName: {
      color: '#000',
    },
    meListMessage: {
      color: '#646464',
    },
    messageListTime: {
      color: '#74858a',
    },
    // wallet dashboard
    wDFormContainer: {
      backgroundColor: '#fff',
    },
    wdFormInfoText: {
      color: '#000',
    },
    wdTabContainer: {
      backgroundColor: '#f0f0f0',
    },
    wdTabButton: {
      backgroundColor: '#e0e0e0',
    },
    wdActiveTab: {
      backgroundColor: '#ffffff',
      borderColor: '#007bff',
    },
    wdTabText: {
      color: '#333',
    },
    wdActiveTabText: {
      color: '#000',
    },
    wdRefStateCard: {
      backgroundColor: '#f5f5f5',
      shadowColor: '#000',
    },
    wdRefStateTitle: {
      color: '#555',
    },
    wdRefStateValue: {
      color: '#222',
    },
    wdAmountButton: {
      backgroundColor: '#e6f0ff',
    },
    wdAmountSelected: {
      backgroundColor: '#004080',
      borderColor: '#007bff',
    },
    wdAmountText: {
      color: '#004080',
    },
    wdAmountTextSelected: {
      color: '#fff',
    },
    // bank details modal
    bdLabel: {
      color: '#717580',
    },
    // report modal
    reportSectionTitle: {
      color: '#000',
    },
    reportCategoryCard: {
      backgroundColor: '#f7f7f7',
    },
    reportCategoryTitle: {
      color: '#000',
    },
    reportSubCategoryHeader: {
      color: '#000',
    },
    reportSubCategoryCard: {
      backgroundColor: '#f7f7f7',
      borderColor: '#d9d9d9',
    },
    reportSelectedSubCategoryCard: {
      backgroundColor: '#d6d6d6ff',
      borderColor: '#d93a63',
    },
    reportSubCategoryTitle: {
      color: '#000',
    },
    reportLoadingContainer: {
      backgroundColor: '#fff',
    },
    reportDescriptionLabel: {
      color: '#000',
    },
    reportDescriptionInput: {
      backgroundColor: '#f7f7f7',
      color: '#000',
    },
    googleAdContainer: {
      backgroundColor: '#fff',
    },
    // footer
    footer: {
      backgroundColor: '#fff',
      borderTopColor: '#ddd', // optional: a light border color
    },
    // leader board
    leaderBoardContainer: {
      backgroundColor: '#fff',
    },
    leaderBoardHeader: {
      backgroundColor: '#fff',
    },
    leaderBoardFilterButton: {
      backgroundColor: '#fff',
      borderBottomColor: '#d9d9d9',
    },
    leaderBoardFilterText: {
      color: '#000',
    },
    leaderboardItem: {
      backgroundColor: '#fff',
      borderBottomColor: '#d9d9d9',
    },
    lbRankText: {
      color: '#000',
    },
    lbAvatar: {
      backgroundColor: '#fff',
    },
    lbUsername: {
      color: '#000',
    },
    lbLocation: {
      color: '#999',
    },
    lbStarButton: {
      backgroundColor: '#fff',
      borderColor: '#bdbdbdff',
    },
  },
  dark: {
    // splash screen
    SplashScreen: {
      backgroundColor: '#2a2a2a',
    },
    // common styles
    container: { backgroundColor: '#121212' },
    formContainer: { backgroundColor: '#1e1e1e' },
    text: { color: '#fff' },
    input: { borderColor: '#444', backgroundColor: '#2a2a2a', color: 'white' },
    button: { color: 'black' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: '#ff5555' },
    success: { color: '#55ff55' },
    primary: { color: '#1a73e8' },
    placeholder: { color: '#aaa' },
    roomItem: { backgroundColor: '#2a2a2a' },
    splashButtonText: { color: '#fff' },
    SingInlabel: { color: 'white' },
    question: {
      color: '#fff',
    },
    // modal css
    profileModalOverlay: {
      backgroundColor: '#2a2a2a',
    },
    psmProfileTopCard: {
      backgroundColor: '#2a2a2a',
    },
    psmProfileImageContainer: {
      backgroundColor: '#2a2a2a',
    },
    psmTopGiftersContainer: {
      backgroundColor: '#2a2a2a',
    },
    psmProfileName: {
      color: '#fff',
    },
    pSettingMDarkLightSTitle: {
      color: '#fff',
    },
    profileErrorBoxMain: {
      backgroundColor: '#2a2a2a',
    },
    fullScreenModalOverlay: {
      backgroundColor: '#2a2a2a',
    },
    modalSmallTitle: {
      color: '#fff',
    },

    // profile css
    profileHeader: {
      backgroundColor: '#2a2a2a',
      borderBottomColor: '#d9d9d9',
      borderBottomWidth: 1,
    },
    profileScrollContainer: {
      backgroundColor: '#2a2a2a',
    },
    profileMainText: {
      color: '#fff',
    },
    profileValueText: {
      color: '#fff',
    },
    profileStatLabel: {
      color: '#fff',
    },
    profileStatValue: {
      color: '#fff',
    },
    profileStatCard: {
      backgroundColor: '#2a2a2a',
      shadowColor: '#fff',
    },
    profileTable: {
      backgroundColor: '#2a2a2a',
    },
    profileTableHeader: {
      backgroundColor: '#2a2a2a',
    },
    profileTableHeaderText: {
      color: '#fff',
    },
    profileTableCell: {
      color: '#fff',
    },
    profileTableRow: {
      backgroundColor: '#2a2a2a',
    },
    profileActionButtonText: {
      color: '#fff',
    },
    profileActionBtnBox: {
      backgroundColor: '#2a2a2a',
    },
    // stream list

    streamListHeader: {
      backgroundColor: '#2a2a2a',
      borderBottomColor: '#323232',
      borderBottomWidth: 1,
    },
    strHeaderCategoryButton: {
      backgroundColor: '#2a2a2a',
      shadowColor: '#fff',
    },
    strHeaderCategoryText: {
      color: '#fff',
    },
    streamListMainTitle: {
      color: '#fff',
      // backgroundColor: '#2a2a2a'
    },
    streamListMainCardLayout: {
      backgroundColor: '#2a2a2a',
    },
    isFilteringBlurBackground: {
      backgroundColor: 'rgba(19, 19, 19, 0.3)', // subtle blur feel using transparency
    },

    streamListEyeCountContainer: {
      backgroundColor: '#575757b3',
      borderColor: '#fff',
    },
    streamListEyeCount: {
      color: '#fff',
    },
    streamListName: {
      color: '#fff',
    },
    // message list

    messageListMainCardLayout: {
      backgroundColor: '#2a2a2a',
    },
    messageListContainer: {
      backgroundColor: '#2a2a2a',
      borderBottomColor: '#4e4e4eff',
    },
    messageListName: {
      color: '#fff',
    },
    meListMessage: {
      color: '#fff',
    },
    messageListTime: {
      color: '#fff',
    },
    // wallet dashboard
    wdTabContainer: {
      backgroundColor: '#323232d9',
    },
    wDFormContainer: {
      backgroundColor: '#2a2a2a',
    },
    wdFormInfoText: {
      color: '#fff',
    },
    wdTabButton: {
      backgroundColor: '#2c2c2c',
    },
    wdActiveTab: {
      backgroundColor: '#1a1a1a',
      borderColor: '#4da3ff',
    },
    wdTabText: {
      color: '#ccc', // light gray for inactive tab text
    },
    wdActiveTabText: {
      color: '#fff', // pure white for active tab text
    },
    wdRefStateCard: {
      backgroundColor: '#2a2a2a',
      shadowColor: '#fff',
    },
    wdRefStateTitle: {
      color: '#ccccccff',
    },
    wdRefStateValue: {
      color: '#fff',
    },
    wdAmountButton: {
      backgroundColor: '#333c4a',
    },
    wdAmountSelected: {
      backgroundColor: '#1a2b44',
      borderColor: '#4da3ff',
    },
    wdAmountText: {
      color: '#cce4ff',
    },
    wdAmountTextSelected: {
      color: '#fff',
    },
    // bank details modal
    bdLabel: {
      color: '#fff',
    },
    // report modal
    reportSectionTitle: {
      color: '#fff',
    },
    reportCategoryCard: {
      backgroundColor: '#1a1a1a',
    },
    reportCategoryTitle: {
      color: '#fff',
    },
    reportSubCategoryHeader: {
      color: '#fff',
    },
    reportSubCategoryCard: {
      backgroundColor: '#1a1a1a',
      borderColor: '#333',
    },
    reportSelectedSubCategoryCard: {
      backgroundColor: '#2a2a2a',
      borderColor: '#d93a63',
    },
    reportSubCategoryTitle: {
      color: '#fff',
    },
    reportLoadingContainer: {
      backgroundColor: '#0f0f0f',
    },
    reportDescriptionLabel: {
      color: '#fff',
    },
    reportDescriptionInput: {
      backgroundColor: '#1a1a1a',
      color: '#fff',
    },
    googleAdContainer: {
      backgroundColor: '#2a2a2a',
    },
    // footer
    footer: {
      backgroundColor: '#2a2a2a',
      borderTopColor: '#323232', // optional: a light border color
    },
    // leader board
    leaderBoardContainer: {
      backgroundColor: '#2a2a2a',
    },
    leaderBoardHeader: {
      backgroundColor: '#2a2a2a',
    },
    leaderBoardFilterButton: {
      backgroundColor: '#2a2a2a',
      borderBottomColor: '#333',
    },
    leaderBoardFilterText: {
      color: '#fff',
    },
    leaderboardItem: {
      backgroundColor: '#2a2a2a',
      borderBottomColor: '#4e4e4eff',
    },
    lbRankText: {
      color: '#fff',
    },
    lbAvatar: {
      backgroundColor: '#2a2a2a',
    },
    lbUsername: {
      color: '#fff',
    },
    lbLocation: {
      color: '#d4d4d4ff',
    },
    lbStarButton: {
      backgroundColor: '#2a2a2a',
      borderColor: '#bdbdbdff',
    },
  },
};
