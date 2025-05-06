import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export const usePushNotifications = () => {
  // Configura o manipulador de notificações
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  // Estados para armazenar o token e a notificação
  const [expoPushToken, setExpoPushToken] = useState();
  const [notification, setNotification] = useState();

  // Referências para os listeners de notificação
  const notificationListener = useRef();
  const responseListener = useRef();

  // Função para registrar o dispositivo para receber notificações push
  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      // Verifica e solicita permissões para notificações
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }

      // Obtém o token de notificação
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    // Configura o canal de notificação para Android
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  // Efeito para configurar os listeners e registrar o dispositivo
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    // Listener para notificações recebidas
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener para respostas a notificações
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    // Limpa os listeners ao desmontar o componente
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Retorna o token e a notificação atual
  return {
    expoPushToken,
    notification,
  };
};