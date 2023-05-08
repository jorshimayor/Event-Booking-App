import path from 'path';
import fs from 'fs';

function buildPath() {
	return path.join(process.cwd(), 'data', 'data.json');
}

function extractData(filePath) {
	const jsonData = fs.readFileSync(filePath);
	const data = JSON.parse(jsonData);
	return data;
}

export default function handler(req, res) {
	const { method } = req;

	//  Access the data
	//  Extract the data from {AllEvents}
	// 	 res 404 if there's no event to handle
	//  AllEvents - loop through them and identify the EventID
	//  Add the email into emails_registered
	// 	 Only if it doesn't already exist
	// 	 Check the format of the email is OK

	const filePath = buildPath();
	const { events_categories, allEvents } = extractData(filePath);

	if (!allEvents) {
		return res.status(404).json({ status: 404, message: 'No events found' });
	}

	if (method === 'POST') {
		const { email, eventId } = req.body;

		if( !email | !email.includes('@') {
			res.status(422).json({message: 'Invalid email address'});
			return;
		}

		const newAllEvents = allEvents.map((ev) => {
			if (ev.id === eventId) {
				if (ev.emails_registered.includes(email)) {
					res
						.status(409)
						.json({ message: 'This email has already been registered' });
					return ev;
				}
				return {
					...ev,
					emails_registered: [...ev.emails_registered, email],
				};
			}
			return ev;
		});

		fs.writeFileSync(
			filePath,
			JSON.stringify({ events_categories, allEvents: newAllEvents })
		);

		res.status(200).json({
			message: `You have successfully registered with this email: ${email} and ${eventId}`,
		});
	}
}
