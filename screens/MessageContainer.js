import React from 'react'
import { View, Text, Linking } from 'react-native'
import { Avatar, Bubble, SystemMessage, Message, MessageText, MessageImage } from 'react-native-gifted-chat'
import { FontAwesome } from '@expo/vector-icons';

const WWW_URL_PATTERN = /^www\./i

export const renderAvatar = props => (
  <Avatar
    {...props}
    containerStyle={{ left: { borderWidth: 3, borderColor: 'red' }, right: {} }}
    imageStyle={{ left: { borderWidth: 3, borderColor: 'blue' }, right: {} }}
  />
)

export const renderBubble = props => (
  <Bubble
    {...props}
    // renderTime={() => <Text>Time</Text>}
    // renderTicks={() => <Text>Ticks</Text>}
    containerStyle={{
      left: { borderColor: 'teal', borderWidth: 8 },
      right: {},
    }}
    wrapperStyle={{
      left: { borderColor: 'tomato', borderWidth: 4 },
      right: {},
    }}
    bottomContainerStyle={{
      left: { borderColor: 'purple', borderWidth: 4 },
      right: {},
    }}
    tickStyle={{}}
    usernameStyle={{ color: 'tomato', fontWeight: '100' }}
    containerToNextStyle={{
      left: { borderColor: 'navy', borderWidth: 4 },
      right: {},
    }}
    containerToPreviousStyle={{
      left: { borderColor: 'mediumorchid', borderWidth: 4 },
      right: {},
    }}
  />
)

export const renderSystemMessage = props => (
  <SystemMessage
    {...props}
    containerStyle={{ backgroundColor: 'pink' }}
    wrapperStyle={{ borderWidth: 10, borderColor: 'white' }}
    textStyle={{ color: 'crimson', fontWeight: '900' }}
  />
)

export const renderMessage = props => (
  <Message
    {...props}
    // renderDay={() => <Text>Date</Text>}
    containerStyle={{
      left: { backgroundColor: 'lime' },
      right: { backgroundColor: 'gold' },
    }}
    
  />
)
const onUrlPress = (url) => {
    // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
    // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
    if (WWW_URL_PATTERN.test(url))
      onUrlPress(`https://${url}`)
    else
      Linking.openURL(url).catch(e => {
        error(e, 'No handler for URL:', url)
      })
}

export const renderMessageText = props => (
    <View>
        {props.currentMessage.user._id == 0? 
        (<View>
            <Text style={{fontWeight: "bold", fontSize: 20, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}>
            {props.currentMessage.title}  <Text style={{marginLeft: 5}}></Text>
            {props.currentMessage.tier == "NEGATIVE" ? (
                    <Text style={{color: 'red', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}><FontAwesome name="thumbs-down" size={18} color="red"/></Text>
                ): props.currentMessage.tier == "POSITIVE" ? (
                    <Text style={{color: 'green', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}><FontAwesome name="thumbs-up" size={18} color="green"/></Text>
                ) : (
                    <Text style={{color: 'grey', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}></Text>
                )}
            </Text>
            <Text style={{fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}>
                <Text style={{fontSize: 16, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}>
                    Noticia com indicador 
                </Text>
                {props.currentMessage.tier == "NEGATIVE" ? (
                    <Text style={{fontWeight: "bold", color: 'red', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}> NEGATIVO </Text>
                ): props.currentMessage.tier == "POSITIVE" ? (
                    <Text style={{fontWeight: "bold", color: 'green', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}> POSITIVO </Text>
                ) : (
                    <Text style={{fontWeight: "bold", color: 'grey', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}> NEUTRO </Text>
                )}
                <Text style={{fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}>
                com score de 
                </Text>
                {props.currentMessage.tier == "NEGATIVE" ? (
                    <Text style={{fontWeight: "bold",color: 'red', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}> {props.currentMessage.score} </Text>
                ): props.currentMessage.tier == "POSITIVE" ? (
                    <Text style={{fontWeight: "bold",color: 'green', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}> {props.currentMessage.score} </Text>
                ) : (
                    <Text style={{fontWeight: "bold",color: 'grey', fontSize: 16, lineHeight: 20, marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10}}> {props.currentMessage.score} </Text>
                )}
            </Text>
            <Text style={{fontSize: 16, lineHeight: 20, marginTop: 5, marginLeft: 10, marginRight: 10}}>
            Verifique a noticia no Link do Portal:
            </Text>
            <MessageText
            {...props}
            linkStyle={{
                left: { color: 'blue' },
                right: { color: 'blue' },
              }}/>
        </View>

        ) : (<MessageText
            {...props}
            />)}
    </View>
)

export const renderMessageImage = props => (
  <MessageImage
    {...props}
    imageStyle={{ resizeMode: 'stretch', width: 250, height: 100}}
    imageSourceProps={{ resizeMode: 'stretch' }}
    lightboxProps={{
      disabled: true
    }}
  />
)

export const renderCustomView = ({ user }) => (
  
  <View style={{ minHeight: 20, alignItems: 'center' }}>
    <Text>
      Current user:
      {user.name}
    </Text>
    <Text>From CustomView</Text>
  </View>
)