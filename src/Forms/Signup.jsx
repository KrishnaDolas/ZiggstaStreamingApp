import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity ,ScrollView  } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { styles, themeStyles } from '../../assets/styles/ThemeStyles';
import LinearGradient from 'react-native-linear-gradient';
export const Signup = ({userData,setUserData,ShowloginForm, onToggleForm,SigninWithApple,SigninWithFacebook,SigninWithGoogle,theme }) => {
    const [username, setUsername] = useState(userData.username || '');
    const [password, setPassword] = useState(userData.password || '');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      const [error, setError] = useState('');
  
    const handleSignUp = async () => {
      try {
        if (!username || !password) {
          setError('Please fill in all fields');
          return;
        }else if (username.length < 6) {
            setError('Please enter a valid email address');
            return;
        }else if(password.length < 6){
            setError('Password must be at least 6 characters long');
            return;
        }else if (password.includes(' ') ) {
            setError('Password cannot contain spaces');
            return;
        }else if(password!==confirmPassword){
            setError('Password Does not match');
            return;
        }
        setUserData({username: username, password: confirmPassword});
        onToggleForm();
        console.log(`Username: ${username}, Password: ${password}`);
        
      } catch (err) {
        console.log(err);
        setError(err?.response?.data?.error || 'Something went wrong');
      }
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
      <>
      <ScrollView style={{position:'absolute', flex:1, width:'100%', height:'100%',top:'10%'}}>
      <View style={[styles.formContainer, themeStyles[theme].formContainer]}>
        <Text style={[styles.formTitle, themeStyles[theme].text]}>Sign Up</Text>
        <View style={[{ width:'100%',padding:'7' }]}>
        <Text style={[styles.SingInlabel,themeStyles[theme].SingInlabel]}>User Name</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={[styles.input, themeStyles[theme].input]}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={themeStyles[theme].placeholder.color}
        />
        </View>
        <View style={[{ width:'100%',padding:'7' }]}>
        <Text style={[styles.SingInlabel,themeStyles[theme].SingInlabel]}>Password</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={[styles.input, themeStyles[theme].input]}
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor={themeStyles[theme].placeholder.color}
        />
        <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={{ padding: 10,position: 'absolute', right: 15, top: 10}}>
        <Icon
          name={showConfirmPassword ? 'eye' : 'eye-slash'}
          size={20}
          color={theme === 'light' ? 'black' : 'white'}
        />
        </TouchableOpacity>
        </View>
        </View>
        <View style={[{ width:'100%',padding:'7' }]}>
        <Text style={[styles.SingInlabel,themeStyles[theme].SingInlabel]}>Confirm Password</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, themeStyles[theme].input]}
          secureTextEntry={!showPassword}
          placeholderTextColor={themeStyles[theme].placeholder.color}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={{ padding: 10,position: 'absolute', right: 15, top: 10}}>
        <Icon
          name={showPassword ? 'eye' : 'eye-slash'}
          size={20}
          color={theme === 'light' ? 'black' : 'white'}
        />
        </TouchableOpacity>
        </View>
        </View>
        <View style={styles.Loginerror}>
        {error ? <Text style={[styles.error, themeStyles[theme].error]}>{error}</Text> : null}
        </View>
        <LinearGradient
          colors={['rgb(238, 41, 123)', 'rgb(183, 1, 255)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.button}
        >
        <TouchableOpacity style={[themeStyles[theme].button]} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        </LinearGradient>
        <TouchableOpacity onPress={()=>ShowloginForm()} style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline',fontSize:16 }}>Already have an account? Sign In</Text>
        </TouchableOpacity>
        <View style={styles.Othersinginoption}>
        <View style={styles.Loginoption}>
        <TouchableOpacity style={[styles.Loginoptionbtn,styles.Applebtn]} onPress={()=> SigninWithApple()}>
        <Icon name="apple" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.Loginoptionbtn,styles.Facebookbtn]} onPress={()=>SigninWithFacebook()}>
        <Icon name="facebook" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.Loginoptionbtn,styles.Googlebtn]} onPress={()=>SigninWithGoogle()}>
        <Icon name="google" size={24} color="#fff" />
        </TouchableOpacity>
        </View>
        </View>
      </View>
      </ScrollView>
      </>
    );
  };