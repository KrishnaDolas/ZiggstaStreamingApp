// components/Skeleton.js
import React, { useContext } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';
import Colors from '../../assets/styles/Colors';
const screenHeight = Dimensions.get('window').height;

const SkeletonCard = () => {

    const { theme } = useContext(ThemeContext);

    const isLight = theme === 'light';
    const cardBackground = isLight ? '#fff' : Colors.blackBgColor;
    const shimmerBaseColor = isLight ? '#e0e0e0' : Colors.blackCardColor;
    const shimmerHighlightColor = isLight ? '#f5f5f5' : '#333333ff';


    return (
        <View style={[styles.card, { backgroundColor: cardBackground }]}>
            <ShimmerPlaceHolder
                shimmerStyle={styles.image}
                LinearGradient={LinearGradient}
                shimmerColors={[shimmerBaseColor, shimmerHighlightColor, shimmerBaseColor]}
            />
            <ShimmerPlaceHolder
                shimmerStyle={[styles.line, { width: '100%' }]}
                LinearGradient={LinearGradient}
                shimmerColors={[shimmerBaseColor, shimmerHighlightColor, shimmerBaseColor]}
            />
            <ShimmerPlaceHolder
                shimmerStyle={[styles.line, { width: '60%' }]}
                LinearGradient={LinearGradient}
                shimmerColors={[shimmerBaseColor, shimmerHighlightColor, shimmerBaseColor]}
            />
        </View>
    )
};

const StreamListSkeleton = ({ count = 6, columns = 2 }) => {
    return (
        <FlatList
            data={[...Array(count).keys()]}
            keyExtractor={(item) => item.toString()}
            numColumns={columns}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.grid}
            contentContainerStyle={styles.container}
            renderItem={() => <SkeletonCard />}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingTop: 10,
        paddingBottom: 50,
    },
    grid: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: '48%',
        borderRadius: 10,
        padding: 10,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: screenHeight * 0.3 - 100,
        borderRadius: 10,
        marginBottom: 10,
    },
    line: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginBottom: 8,
    },
});

export default StreamListSkeleton;
