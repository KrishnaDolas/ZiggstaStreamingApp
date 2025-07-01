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
    marginBottom: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '50%',
    position: 'relative',
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
  StreamLoader:{
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
    justifyContent: 'center', // optional: space-around, space-evenly
  },
  streamVideo: {
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
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
    borderTopColor: '#ddd', // optional: a light border color
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
    paddingVertical: 30,
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
    backgroundColor: '#f44336',
    padding: 12,
    margin: 10,
    borderRadius: 8,
  },

  profileErrorText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  // profile style end

  // profile modal

  profileModalMain: {
    justifyContent: 'flex-end',
    margin: 0,
  },

  profileModalOverlay: {
    backgroundColor: 'white',
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
    color: '#232323',
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
    backgroundColor: 'transparent',
  },

  streamListHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginRight: 12,
    backgroundColor: '#d93a63',
    borderRadius: 30,
    // padding: 5,
    paddingLeft: 8,
    paddingRight: 5,
    paddingVertical: 3
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
    paddingBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  strHeaderCategoryButton: {
    backgroundColor: '#ebebeb',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginHorizontal: 5,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Shadow for Android
    elevation: 3,
  },

  strHeaderCategoryText: {
    color: '#232323',
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
    paddingHorizontal: 10,
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
  },
  streamListName: {
    fontWeight: 'bold',
    fontSize: 16,
    maxWidth: 'auto',
  },
  streamListStatus: {
    color: '#fff',
    fontSize: 14,
    maxWidth: '90%',
  },
  streamListFiltersBtnGroup: {
    position: 'absolute',
    bottom: '8.4%',
    left: '50%',
    transform: [{ translateX: -0.475 * screenWidth }],
    flexDirection: 'row',
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
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
    paddingHorizontal: 25,
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
    color: '#000',
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
    backgroundColor: 'white',
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
  },


  modalCategoryButton: {
    backgroundColor: 'rgba(184, 58, 243, 1)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5,
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
    borderBottomColor: '#dbdbdb',
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
    fontSize: 13,
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
    height: 150,
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
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
  },
  strRoomFooterSocialActionsBtn: {
    marginBottom: 24,
  },
  strRoomBottomBox: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strRoomBottomBoxInput: {
    flex: 1,
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
    bottom: 80,
    right: '10%',
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
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 7,
  },
  wdActiveTab: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  wdTabText: {
    color: '#333',
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
    backgroundColor: '#e6f0ff',
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  wdAmountSelected: {
    backgroundColor: '#004080',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  wdAmountText: {
    color: '#004080',
    fontWeight: '500',

  },
  wdAmountTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  wDFormContainer: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 10,
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
  wdFormGradientButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginVertical: 12,
  },

  wdFormButtonOverlay: {
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  wdFormSubmitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  wdFormInfoText: {
    color: '#000',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
    // Box shadow equivalent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Required for Android
  },
  wdRefStateTitle: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  wdRefStateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#222',
    textAlign: 'center',
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
    color: '#717580',
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
});

// Theme Styles
export const themeStyles = {
  light: {
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
    // profile css
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
  },
  dark: {
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
  },
};
