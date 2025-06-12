// components/Skeleton.js
import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
const screenHeight = Dimensions.get('window').height;

const SkeletonCard = () => (
    <View style={styles.card}>
        <ShimmerPlaceHolder
            shimmerStyle={styles.image}
            LinearGradient={LinearGradient}
        />
        <ShimmerPlaceHolder
            shimmerStyle={[styles.line, { width: '100%' }]}
            LinearGradient={LinearGradient}
        />
        <ShimmerPlaceHolder
            shimmerStyle={[styles.line, { width: '60%' }]}
            LinearGradient={LinearGradient}
        />
    </View>
);

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
        backgroundColor: '#fff',
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
