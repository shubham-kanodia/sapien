import React from "react";
import { IDKitWidget } from '@worldcoin/idkit';

export default function WorldIDWidget(props) {
	return (
		<IDKitWidget
			app_id="app_9437652fbab8fcb0301b4bf198527bad"
			action="sign_in" // this is your action name from the Developer Portal
			onSuccess={props.onSuccess} // callback when the modal is closed
			// handleVerify={props.handleVerify} // optional callback when the proof is received
			credential_types={['orb', 'phone']} // optional, defaults to ['orb']
			enableTelemetry // optional, defaults to false
		>
			{({ open }) => (
				<button
					type="button"
					className="mt-10 flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
					onClick={open}
				>Connect World ID
				</button>)}
		</IDKitWidget>
	);
}
