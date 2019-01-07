import React, {Component} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    Image
} from "react-native";
import PropTypes from "prop-types";
import Carousel from "react-native-looped-carousel";
import {Permissions, Notifications} from "expo";

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "purple",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    home: {
        width: "100%",
        backgroundColor: "orange",
        overflow: "hidden",
        marginTop: "7%"
    }
});

const PER_PAGE = 5;
class Homes extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fromNotif: [],
            index: PER_PAGE
        };

        this.width = 0;
    }

    componentWillMount() {
        this.width = Dimensions.get("window").width;
        Permissions.getAsync(Permissions.NOTIFICATIONS)
            .then(({status}) => {
                if (status === "granted") {
                    this.sendNotificationsToken();
                } else {
                    return Permissions.askSync(Permissions.NOTIFICATIONS)
                        .then(({status}) => {
                            if (status === "granted") {
                                this.sendNotificationsToken();
                            }
                        });
                }
            })
            .catch(error => console.error(error));
        Notifications.addListener(notification => this.setState({fromNotif: notification.data.homes}));
    }

    sendNotificationsToken() {
        Notifications.getExpoPushTokenAsync()
            .then(token => this.props.sendNotificationsToken(token))
            .catch(error => console.error(error));
    }

    renderHomes() {
        const fromNotif = this.state.fromNotif.length > 0;
        const homes = fromNotif ?
            this.props.homes.filter(({checksum}) => this.state.fromNotif.includes(checksum)) :
            this.props.homes;
        if (homes.length === 0) {
            return (
                <Text>{fromNotif ? "Notification has expired" : "No home match with your criteria"}</Text>
            );
        }
        return (
            <FlatList
                removeClippedSubviews={true}
                onEndReachedThreshold={0.1}
                onEndReached={() => this.setState({index: this.state.index += PER_PAGE})}
                data={fromNotif ?
                    homes :
                    homes.slice(0, this.state.index)}
                renderItem={({item}, key) => {
                    return (
                        <View style={styles.home} key={`home${key}`}>
                            <Carousel
                                style={{width: this.width, height: 300, backgroundColor: "green"}}
                                autoplay={false}
                                arrows={true}
                                leftArrowStyle={{height: "100%", width: this.width / 2}}
                                rightArrowStyle={{height: "100%", width: this.width / 2}}
                                leftArrowText={" "}
                                rightArrowText={" "}
                                bullets={true}
                            >
                                {item.images !== null ? item.images.map((uri, key) => {
                                    return (
                                        <Image
                                            source={{uri}}
                                            style={{width: this.width, height: "100%", resizeMode: "contain"}}
                                            key={`${item.checksum}${key}`}
                                        />
                                    );
                                }) : <View />}
                            </Carousel>
                            <Text>{`${item.from.substr(0, 1).toUpperCase()}${item.from.substr(1)}`}</Text>
                            <Text>{item.description}</Text>
                        </View>
                    );
                }}
            >
				
            </FlatList>
        );
    }

    render() {
        return (
            <View style={styles.wrapper}>
                {this.renderHomes()}
            </View>
        );
    }
}

Homes.propTypes = {
    homes: PropTypes.array.isRequired,
    sendNotificationsToken: PropTypes.func.isRequired
};

export default Homes;

