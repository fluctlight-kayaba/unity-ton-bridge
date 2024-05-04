import { tonConnectUI } from './util';

export const connect = async () => {
	return tonConnectUI.openModal();
};

export const disconnect = async () => {
	tonConnectUI.disconnect();
};
