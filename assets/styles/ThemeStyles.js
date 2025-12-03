import { StyleSheet, Platform } from 'react-native';
import { Dimensions } from 'react-native';
import Colors from './Colors';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Calculate item width
const giftCardItemWidth = (screenWidth - (31 * (4 + 1))) / 4;

// This file contains the styles for the application, including light and dark themes.
export const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    position: 'relative',
  },
  container: {
    padding: 0,
    flex: 1,
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
    // height: '100%',
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
    borderRadius: 30,
    padding: 12,
    width: '100%',
    marginVertical: 10,
    fontSize: 16,
  },
  bioDesCharCount: {
    position: 'absolute',
    right: 5,
    bottom: -25,
    fontSize: 12,
  },
  button: {
    borderRadius: 30,
    marginHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: 200,
    height: 50,
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
    flex: 1,
    backgroundColor: '#1d1d1d',
    position: 'relative',
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
    zIndex: 10,
  },
  streamVideosInnerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    zIndex: 15
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
    zIndex: 19,
  },

  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 25,
  },

  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 6,
    zIndex: 45
  },

  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },

  friendRequestIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50
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
  controls: {
    position: 'absolute',
    height: screenHeight * 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: screenWidth * 1,
    // paddingVertical: 10,
    // backgroundColor: 'transparent',
    zIndex: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    overflow: 'hidden',
    minWidth: 140,
    height: 50,
  },
  splashButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  question: {
    fontSize: 20,
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
    // bottom: 160,
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
  btnInterestActiveBlue: {
    backgroundColor: '#0035ff',
  },



  // profile style start

  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
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
  },

  profileStatLabel: {
    fontSize: 14,
    marginBottom: 10,
  },

  profileStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  profileTable: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },

  profileTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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


  settingProfileContainer: {
    flex: 1,
  },
  settingProfileLayoutContainer: {
    paddingHorizontal: 20,
  },
  settingProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  settingProfileBackButton: {
    padding: 8,
    marginRight: 15,
  },
  settingProfileHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    // color: '#333',
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
    overflow: 'hidden',
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
    // borderBottomColor: '#eee',
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
    // borderColor: '#a5a5a5',
    borderWidth: 0.4,
    // backgroundColor: '#f7f7f7',
    borderRadius: 20,
    // color: '#414141',
    paddingHorizontal: 13,
    fontSize: 15,
  },

  profileSettingModalBody: {
    marginHorizontal: 5,
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
    marginBottom: 2,
  },

  profileSettingMMenuList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 17,
    // borderColor: '#eee',
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
    // position: 'relative',
  },
  bottomShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -15,            // or a small positive value
    height: 16,            // small gradient height
    pointerEvents: 'none', // never block touches
    zIndex: 0,
  },

  streamListHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    justifyContent: 'space-between',
    marginRight: 12,
    backgroundColor: '#d93a63',
    borderRadius: 30,
    // padding: 5,
    // paddingLeft: 8,
    paddingRight: 8,
    // paddingVertical: 3,
    minWidth: 65,
  },

  streamHeaderCountTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
    // paddingEnd: 10,
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
    paddingHorizontal: 0,
    // paddingBottom: 3,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  strHeaderCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginHorizontal: 5,
    // Shadow for iOS
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Shadow for Android
    elevation: 3,
  },

  strHeaderCategoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnInterestActiveText: {
    color: '#fff',
  },

  streamListMainCardLayout: {
    flex: 1,
    paddingBottom: 10,
    position: 'relative',
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
    // paddingTop: 15,
    paddingBottom: 80,
    paddingHorizontal: 10,
    // borderTopColor: '#1e1e1e',
    // borderTopWidth: 0.6,
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
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center', // ✅ centers the whole group
    zIndex: 999,     // <-- IMPORTANT for iOS
    pointerEvents: 'box-none',
    elevation: 10,        // <-- helps on Android, harmless on iOS
  },

  streamListLuckyWheelBtn: {
    position: 'absolute',
    bottom: '16%',
    right: 10,
    zIndex: 9,
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
    width: 135,
    height: 50,
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
    // marginBottom: 10,
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
    justifyContent: 'space-between',
    paddingVertical: 20,
  },


  strHedSearchModalForm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },

  strHedSearchModalInput: {
    // flex: 1,
    // backgroundColor: '#f7f7f7',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    // borderColor: '#eaeaeb',
    borderWidth: 1,
    // color: '#414141',
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
  categoryBtn: {
    backgroundColor: '#be0069',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  categoryBtnActive: {
    backgroundColor: '#d93a63',
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
    // backgroundColor: '#f1f1f1',
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
    position: 'absolute',
    zIndex: 99,
    top: 0,
    width: '100%',
  },
  strRoomHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(36, 32, 32, 0.75)',
    padding: 4,
    borderRadius: 30,
    borderColor: '#242020',
    borderWidth: 1,
    paddingRight: 15,
    // minWidth: 130
  },

  strRoomHeaderLeftProfileImg: {
    width: 35,
    height: 35,
    borderRadius: 24,
    marginRight: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  strRoomHeaderLeftProfileInfo: {
  },
  strRoomHeaderLeftProfileName: {
    color: '#fff',
    marginRight: 10,
    fontSize: 13,
  },
  strRoomHeaderLeftProfileSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    paddingLeft: '5',
    paddingRight: '5'
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
  strGradientBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  strRoomFooter: {
    // position: 'absolute',
    // left: 0,
    // right: 0,
    // bottom: 0,        // ✅ fixed at bottom always
    height: 250,
    width: '100%',
    // zIndex: 9,
    paddingVertical: 20,
  },
  strRoomFooterChatOrActionsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    // marginTop: 18,
    position: 'absolute',
    // bottom: 61,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 10,
  },
  streamChatContainer: {
    flex: 1,
    // height: 215,
    maxHeight: 215,
    position: 'relative',
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
    gap: 20,
  },

  // Add to your styles
  redDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    borderWidth: 1,
    borderColor: '#FFF',
  },

  activeGameDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    borderWidth: 1,
    borderColor: '#FFF',
  },

  strRoomFooterSocialActionsBtn: {
    marginBottom: 0,
    alignSelf: 'flex-end',
    position: 'relative',
  },
  strRoomBottomBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 20,
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
    position: 'relative',
  },
  strRoomBottomBoxIconBox: {
    marginLeft: 20,
  },

  // gift modal
  giftModalCategoryMainLayout: {
    // backgroundColor: '#fff',
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
    // backgroundColor: '#ebebeb',
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 7,
    marginRight: 20,
    // iOS shadow
    // shadowColor: '#000',
    // shadowOffset: { width: 1, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,

    // // Android shadow
    // elevation: 3,
  },
  giftModalCatTabActive: {
    backgroundColor: '#d93a63',
  },
  giftModalCatTabText: {
    // color: '#232323',
    fontSize: 16,
    fontWeight: '500',
  },
  giftModalCatTabActiveText: {
    color: '#fff',
  },
  giftModalItemsMainLayout: {
    // backgroundColor: '#fff',
    marginTop: 0,
    borderRadius: 8,
    height: 200,
    marginHorizontal: 7,
    // borderColor: '#d9d9d9',
    borderWidth: 1,
  },
  giftModalCategoryItemsContainer: {
    // flexDirection: 'row',
    // flexWrap: 'wrap',
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
    right: 70,
    zIndex: 9999,
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
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    paddingHorizontal: 22,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  wdAmountSelected: {
    borderWidth: 2,
  },
  wdAmountText: {
    fontWeight: '500',
  },
  wdAmountTextSelected: {
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
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
    borderWidth: 1,
    paddingLeft: 4,
  },
  wdDropdown: {
    height: 52,
    borderRadius: 5,
    paddingHorizontal: 8,
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
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: 200,
    width: '100%',
    height: 50,
    marginVertical: 12,
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
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  wDReferralStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  wdRefStateCard: {
    borderRadius: 8,
    paddingVertical: 5,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wdRefStateTitle: {
    fontSize: 14,
    // color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  wdRefStateValue: {
    fontSize: 18,
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
    borderRadius: 30,
    // backgroundColor: '#f7f7f7',
    // borderColor: '#eaeaeb',
    borderWidth: 1,
    padding: 12,
    width: '100%',
    fontSize: 15,
    marginBottom: 10,
    // color: '#414141',
  },

  // profile screen modal main

  psmHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  psmReportButton: {
    // backgroundColor: '#e6f0ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  psmReportButtonText: {
    // color: '#004080',
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
    marginBottom: 2,
  },
  psmProfileId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  psmProfileDesContainer: {
    marginBottom: 5,
    padding: 16,
    borderRadius: 4,
    // backgroundColor: '#f7f7f78c',
    position: 'relative',
    width: '96%',
  },
  psmProfileDes: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 6,
    textAlign: 'center',
  },
  profileDescIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 6,
    borderRadius: 3,
    borderWidth: 0,
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
  pLikeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pLikeStatsBox: {
    // backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    marginTop: 10, // Adjust this to position it correctly on your screen
    shadowColor: '#00000080',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pLikeStatItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  pLikeStatCount: {
    fontSize: 18,
    fontWeight: 'bold',
    // color: '#333',
  },
  pLikeStatLabel: {
    fontSize: 11,
    // color: '#888',
  },
  pLikeIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  psmSocialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
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
    // backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    flex: 1,
    borderBottomWidth: 1,
    // borderBottomColor: '#f0f0f0',
    borderRightWidth: 1,
    // borderRightColor: '#f0f0f0',
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
    // color: '#333',
    maxWidth: '60%',
  },

  // Other Gifter Amount
  psmOtherGifterAmount: {
    fontSize: 14,
    fontWeight: '500',
    // color: '#666',
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
    width: screenWidth / 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
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
    borderBottomWidth: 1,
    position: 'relative',
    zIndex: 10,
  },
  lbRankBgContainer: {
    position: 'absolute',
    top: 0,
    left: 4,
    bottom: 0,
    zIndex: 1,
  },
  lbRankBgImage: {
    height: '100%',
    width: 115,
    resizeMode: 'contain',
  },
  lbRankTrophyBgContainer: {
    position: 'absolute',
    top: 0,
    left: 12,
    bottom: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lbRankTrophyBgImage: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
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
    zIndex: 99,
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
    borderRadius: 40,
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
    zIndex: 99,
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
    paddingRight: 6,
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
    fontSize: 11,
    fontWeight: '500',
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
    SafeAreaView: { backgroundColor: '#fff' },
    container: { backgroundColor: '#f0f4f8' },
    formContainer: { backgroundColor: '#fff' },
    text: { color: '#333' },
    input: { borderColor: '#eaeaeb', backgroundColor: '#f7f7f7', color: 'rgb(65, 65, 65)' },
    bioDesCharCount: {
      color: '#999',
    },
    button: { color: 'white' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: '#0035ff' },
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
    profileLargeModalOverlay: {
      backgroundColor: 'white',
    },

    psmReportButton: {
      backgroundColor: '#e6f0ff',
    },
    psmReportButtonText: {
      color: '#004080',
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

    profileMSocialBoxItemInput: {
      borderColor: '#a5a5a5',
      backgroundColor: '#f7f7f7',
      color: '#414141',
    },

    profileMSocialBoxItem: {
      borderBottomColor: '#eee',
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
    psmProfileDes: {
      color: '#464646ff',
    },
    psmProfileDesContainer: {
      backgroundColor: '#f7f7f78c',
    },
    profileDescIconContainer: {
      backgroundColor: '#eaf6fb',
      borderColor: '#fff',
    },
    pLikeStatsBox: {
      backgroundColor: '#fff',
    },
    pLikeStatCount: {
      color: '#333',
    },
    pLikeStatLabel: {
      color: '#888',
    },
    psmOtherGifterCard: {
      backgroundColor: '#fff',
      borderBottomColor: '#f0f0f0',
      borderRightColor: '#f0f0f0',
    },
    psmOtherGifterName: {
      color: '#333',
    },

    // Other Gifter Amount
    psmOtherGifterAmount: {
      color: '#666',
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

    profileSettingMDivider: {
      backgroundColor: '#eee',
    },

    profileSettingMMenuList: {
      borderColor: '#eee',
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.46,
      shadowRadius: 12,
      elevation: 5,
    },
    profileStatLabel: {
      color: 'rgb(136, 136, 136)',
    },
    profileStatValue: {
      color: '#d93a63',
    },
    profileTableHeader: {
      backgroundColor: '#f0f0f0',
      borderBottomColor: '#d1d5db',
    },
    profileTable: {
      backgroundColor: '#f9fafb',
      borderColor: '#d9d9d9',
      borderWidth: 0.3,
    },
    profileTableHeaderText: {
      color: '#1f2937',
    },
    profileTableCell: {
      color: '#374151',
    },
    profileTableRow: {
      backgroundColor: '#fff',
      borderBottomColor: '#e5e7eb',
    },
    profileActionButtonText: {
      color: '#000',
    },
    settingProfileContainer: {
      backgroundColor: '#fff',
    },
    settingProfileHeader: {
      borderBottomColor: '#E0E0E0',
    },
    settingProfileHeaderTitle: {
      color: '#333',
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
    strHedSearchModalInput: {
      backgroundColor: '#f7f7f7',
      borderColor: '#eaeaeb',
      color: '#414141',
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
    frActionDeleteBtn: {
      backgroundColor: '#f1f1f1',
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
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2, // Required for Android
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
    wdPickerWrapper: {
      backgroundColor: '#f7f7f7',
      borderColor: '#ccc',
    },
    wdDropdown: {
      backgroundColor: '#f7f7f7',
      color: '#414141',
    },
    // bank details modal
    bdLabel: {
      color: '#717580',
    },
    bdInput: {
      backgroundColor: '#f7f7f7',
      borderColor: '#eaeaeb',
      color: '#414141',
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
      backgroundColor: '#ffffff',
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
    giftModalCatTab: {
      backgroundColor: '#ebebeb',
      // iOS shadow
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,

      // Android shadow
      elevation: 3,
    },
    giftModalCatTabText: {
      color: '#232323',
    },
    giftModalCategoryMainLayout: {
      backgroundColor: '#fff',
    },
    giftModalItemsMainLayout: {
      backgroundColor: '#fff',
      borderColor: '#d9d9d9',
    },
  },
  dark: {
    // splash screen
    SplashScreen: {
      backgroundColor: Colors.blackBgColor,
    },
    // common styles
    SafeAreaView: { backgroundColor: Colors.blackBgColor },
    container: { backgroundColor: Colors.blackBgColor },
    formContainer: { backgroundColor: Colors.blackCardColor, borderWidth: 2, borderColor: Colors.blackCardBorderColor },
    text: { color: '#fff' },
    input: { borderColor: Colors.blackInputBorderColor, backgroundColor: Colors.blackInputBgColor, color: 'white' },
    bioDesCharCount: {
      color: '#fafafa',
    },
    button: { color: 'black' },
    startButton: { backgroundColor: '#34a853' },
    stopButton: { backgroundColor: '#ea4335' },
    linkText: { color: '#1a73e8' },
    error: { color: '#0035ff' },
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
      backgroundColor: Colors.blackModalBgColor,
    },
    profileLargeModalOverlay: {
      backgroundColor: Colors.blackLargeModalBgColor,
    },
    psmReportButton: {
      backgroundColor: Colors.blackBtnBg,
    },
    profileMSocialBoxItemInput: {
      borderColor: Colors.blackDividers,
      backgroundColor: Colors.blackInputBgColor,
      color: '#FFFFFF',
    },

    profileMSocialBoxItem: {
      borderBottomColor: Colors.blackDividers,
    },

    psmReportButtonText: {
      color: '#fff',
    },
    psmProfileTopCard: {
      backgroundColor: Colors.blackLargeModalBgColor,
    },
    psmProfileImageContainer: {
      backgroundColor: Colors.blackLargeModalBgColor,
    },
    psmTopGiftersContainer: {
      backgroundColor: Colors.blackLargeModalBgColor,
    },
    psmProfileName: {
      color: '#fff',
    },
    psmProfileDesContainer: {
      backgroundColor: '#1f1f1fff',
    },
    psmProfileDes: {
      color: '#fff',
    },
    profileDescIconContainer: {
      backgroundColor: '#202020ff',
      borderColor: '#353535ff',
    },
    pLikeStatsBox: {
      backgroundColor: Colors.blackBtnBg,
    },
    pLikeStatCount: {
      color: '#fff',
    },
    pLikeStatLabel: {
      color: '#acacacff',
    },
    psmOtherGifterName: {
      color: '#fff',
    },

    // Other Gifter Amount
    psmOtherGifterAmount: {
      color: '#fff',
    },

    psmOtherGifterCard: {
      backgroundColor: Colors.blackLargeModalBgColor,
      borderBottomColor: Colors.blackDividers,
      borderRightColor: Colors.blackDividers,
    },
    pSettingMDarkLightSTitle: {
      color: '#fff',
    },
    profileSettingMDivider: {
      backgroundColor: Colors.blackDividers,
    },

    profileSettingMMenuList: {
      borderColor: Colors.blackDividers,
    },
    profileErrorBoxMain: {
      backgroundColor: '#2a2a2a',
    },
    fullScreenModalOverlay: {
      backgroundColor: Colors.blackLargeModalBgColor,
    },
    modalSmallTitle: {
      color: '#fff',
    },

    // profile css
    profileHeader: {
      backgroundColor: Colors.blackBgColor,
      borderBottomColor: Colors.blackDividers,
      borderBottomWidth: 1,
    },
    profileScrollContainer: {
      backgroundColor: Colors.blackBgColor,
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
      backgroundColor: Colors.blackCardColor,
    },
    profileTable: {
      backgroundColor: Colors.blackCardColor,
      borderColor: Colors.blackCardBorderColor,
      borderWidth: 1,
    },
    profileTableHeader: {
      backgroundColor: Colors.blackCardColor,
      borderBottomColor: Colors.blackCardBorderColor,
    },
    profileTableHeaderText: {
      color: '#fff',
    },
    profileTableCell: {
      color: '#fff',
    },
    profileTableRow: {
      backgroundColor: Colors.blackCardColor,
      borderBottomColor: Colors.blackCardBorderColor,
    },
    profileActionButtonText: {
      color: '#fff',
    },
    settingProfileContainer: {
      backgroundColor: Colors.blackBgColor,
    },
    settingProfileHeader: {
      borderBottomColor: Colors.blackDividers,
    },
    settingProfileHeaderTitle: {
      color: '#fff',
    },
    profileActionBtnBox: {
      backgroundColor: Colors.blackCardColor,
    },
    // stream list

    streamListHeader: {
      backgroundColor: Colors.blackBgColor,
      borderBottomColor: Colors.blackDividers,
      borderBottomWidth: 1,
    },
    strHeaderCategoryButton: {
      backgroundColor: Colors.blackBtnBg,
      // shadowColor: '#fff',
    },
    strHeaderCategoryText: {
      color: '#fff',
    },
    streamListMainTitle: {
      color: '#fff',
      // backgroundColor: '#2a2a2a'
    },
    strHedSearchModalInput: {
      backgroundColor: Colors.blackInputBgColor,
      borderColor: Colors.blackDividers,
      color: '#fff',
    },
    streamListMainCardLayout: {
      backgroundColor: Colors.blackBgColor,
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
      backgroundColor: Colors.blackBgColor,
    },
    messageListContainer: {
      backgroundColor: Colors.blackBgColor,
      borderBottomColor: Colors.blackDividers,
    },
    messageListName: {
      color: '#fff',
    },
    frActionDeleteBtn: {
      backgroundColor: Colors.blackBtnBg,
    },
    meListMessage: {
      color: '#fff',
    },
    messageListTime: {
      color: '#fff',
    },
    // wallet dashboard
    wdTabContainer: {
      backgroundColor: Colors.blackCardColor,
    },
    wDFormContainer: {
      backgroundColor: Colors.blackCardColor,
    },
    wdFormInfoText: {
      color: '#fff',
    },
    wdTabButton: {
      backgroundColor: Colors.blackBtnBg,
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
      backgroundColor: Colors.blackCardColor,
      // shadowColor: '#fff',
    },
    wdRefStateTitle: {
      color: '#ccccccff',
    },
    wdRefStateValue: {
      color: '#fff',
    },
    wdAmountButton: {
      backgroundColor: Colors.blackBtnBg,
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
    wdPickerWrapper: {
      backgroundColor: Colors.blackInputBgColor,
      borderColor: Colors.blackDividers,
    },
    wdDropdown: {
      backgroundColor: Colors.blackInputBgColor,
      color: '#fff',
    },
    // bank details modal
    bdLabel: {
      color: '#fff',
    },
    bdInput: {
      backgroundColor: Colors.blackInputBgColor,
      borderColor: Colors.blackDividers,
      color: '#fff',
    },
    // report modal
    reportSectionTitle: {
      color: '#fff',
    },
    reportCategoryCard: {
      backgroundColor: Colors.blackBtnBg,
    },
    reportCategoryTitle: {
      color: '#fff',
    },
    reportSubCategoryHeader: {
      color: '#fff',
    },
    reportSubCategoryCard: {
      backgroundColor: Colors.blackBtnBg,
      borderColor: '#333',
    },
    reportSelectedSubCategoryCard: {
      backgroundColor: Colors.blackBtnBg,
      borderColor: '#fff',
    },
    reportSubCategoryTitle: {
      color: '#fff',
    },
    reportLoadingContainer: {
      backgroundColor: Colors.blackLargeModalBgColor,
    },
    reportDescriptionLabel: {
      color: '#fff',
    },
    reportDescriptionInput: {
      backgroundColor: Colors.blackInputBgColor,
      color: '#fff',
    },
    googleAdContainer: {
      backgroundColor: Colors.blackBgColor,
    },
    // footer
    footer: {
      backgroundColor: Colors.blackBgColor,
      borderTopColor: Colors.blackDividers, // optional: a light border color
    },
    // leader board
    leaderBoardContainer: {
      backgroundColor: Colors.blackBgColor,
    },
    leaderBoardHeader: {
      backgroundColor: Colors.blackBgColor,
    },
    leaderBoardFilterButton: {
      backgroundColor: Colors.blackBgColor,
      borderBottomColor: '#333',
    },
    leaderBoardFilterText: {
      color: '#fff',
    },
    leaderboardItem: {
      backgroundColor: Colors.blackBgColor,
      borderBottomColor: Colors.blackDividers,
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
      backgroundColor: Colors.blackCardColor,
      borderColor: Colors.blackDividers,
    },
    giftModalCategoryMainLayout: {
      backgroundColor: Colors.blackCardColor,
    },
    giftModalCatTab: {
      backgroundColor: Colors.blackBtnBg,
    },
    giftModalCatTabText: {
      color: '#fff',
    },
    giftModalItemsMainLayout: {
      backgroundColor: Colors.blackCardColor,
      borderColor: Colors.blackDividers,
    },
  },
};
