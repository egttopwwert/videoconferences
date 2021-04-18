## About The Project

For the past year, there is a sharp rise in the count of online schools and web services because of COVID-19. This resulted in an urgent need for high-quality and not resource-intensive video communications. But all the existing solutions are too expensive or not efficient and require lots of improvements. This project is a way out of this dilemma.

Here is why:
* Your time should be focused on creating a project that solves a problem and helps others, but not on the technical realization of videoconferences. It has already been done for you!
* There is no need to pay a lot for adding real-time video communications to your web service. It is absolutely free!
* This project uses a modular architecture. It allows to integrate this project into real web services easily and to add new features without any troubles.

### Built with

* [React.JS](https://reactjs.org)
* [OpenVidu](https://openvidu.io)

## Getting Started

### Prerequisites

* [OpenVidu](https://docs.openvidu.io/en/2.17.0/deployment)
* [npm](https://nodejs.org/uk)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Start OpenVidu
   ```sh
   docker run -p 4443:4443 --rm -e OPENVIDU_SECRET=MY_SECRET openvidu/openvidu-server-kms:2.17.0
   ```
4. Start videoconference application
   ```sh
   npm start
   ```
   
If all is ok, you will see the form for joining the room. Complete this form with the necessary information and join. Open another browser tab to emulate other users and enter the room with the same code. If you will see 2 users, congratulations! You have done all in the right way. 

If you get any issues, please contact me.

## Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork this project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

## License
Distributed under the MIT License.

## Contact
My developer: Illia Malovanyi - @egttopwwert (Telegram) - egttopwwert@gmail.com (email)

Have a nice day :)
