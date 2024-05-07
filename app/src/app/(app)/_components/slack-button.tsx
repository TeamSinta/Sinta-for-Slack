import Image from "next/image";
import slackGif from "../../../../public/slackanimation.gif";

export default function SlackButton({
    text,
    url,
    onClick,
}: {
    text: string;
    url: string;
    onClick?: () => void;
}) {
    return (
        <a
            onClick={onClick}
            href={url}
            style={{
                fontFamily: "Lato, sans-serif",
                fontSize: "16px",
                fontWeight: "600",
            }}
            className="group inline-flex h-[48px] w-[236px] items-center justify-center rounded-md border border-gray-300 bg-white transition-all hover:border-black dark:bg-black dark:hover:border-white"
        >
            <div className="relative -ml-2.5 mr-0.5 hidden h-10 w-10 group-hover:block">
                <Image
                    src={slackGif}
                    alt="Slack logo animated"
                    layout="fill"
                    priority
                />
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    height: "20px",
                    width: "20px",
                    marginRight: "12px",
                }}
                className="block group-hover:hidden"
                viewBox="0 0 122.8 122.8"
                aria-hidden="true"
            >
                <path
                    d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
                    fill="#e01e5a"
                ></path>
                <path
                    d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
                    fill="#36c5f0"
                ></path>
                <path
                    d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
                    fill="#2eb67d"
                ></path>
                <path
                    d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
                    fill="#ecb22e"
                ></path>
            </svg>
            {text}
        </a>
    );
}
