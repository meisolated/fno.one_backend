/**
 * Purpose of this file is to keep status of all outside connection and
 * reconnect them if they are disconnected and we can also inform some function to halt if connection is not available
 * In case of multiple tries to reconnect but still not able to connect, we can check internet connection and based on that change reconnect algorithm
 *
 * *we may have to remove some auto re-connect logic from other files, so that we can do it here in more systematic way
 */
