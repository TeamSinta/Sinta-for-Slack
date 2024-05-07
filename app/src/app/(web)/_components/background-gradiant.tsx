const BackgroundGradient = ({ hideOverlay = false }) => {
    // Very subtle gradient colors for light mode with a white base
    const fallbackBackgroundLight = `radial-gradient(at top left, #FFFFFF 20%, transparent 80%),
        radial-gradient(at bottom, #E3F2FD 10%, transparent 70%),
        radial-gradient(at bottom left, #EDE7F6 15%, transparent 75%),
        radial-gradient(at top right, #E3F2FD, transparent),
        radial-gradient(at bottom right, #FFFFFF 10%, transparent 60%);`;

    const fallbackBackgroundDark = `radial-gradient(at top left, #4C1D95 30%, transparent 80%),
        radial-gradient(at bottom, #C026D3 0%, transparent 60%),
        radial-gradient(at bottom left, #06B6D4 0%, transparent 50%),
        radial-gradient(at top right, #14B8A6, transparent),
        radial-gradient(at bottom right, #4C1D95 0%, transparent 50%);`;

    // Extremely subtle overlay gradient for light mode to maintain a clean white appearance
    const gradientOverlayLight = `linear-gradient(0deg, ${hideOverlay ? "transparent" : "rgba(255, 255, 255, 0.95)"} 60%, rgba(255, 255, 255, 0) 100%)`;
    const gradientOverlayDark = `linear-gradient(0deg, ${hideOverlay ? "transparent" : "rgba(23, 25, 35, 0.6)"} 60%, rgba(0, 0, 0, 0) 100%)`;

    return (
        <div className="pointer-events-none absolute inset-0 z-[-1]">
            <div className="h-screen w-full overflow-hidden">
                {/* Applying different gradients based on light or dark mode */}
                <div
                    className="absolute inset-0 dark:hidden"
                    style={{
                        backgroundImage: fallbackBackgroundLight,
                        backgroundBlendMode: "saturation",
                        opacity: "0.5",
                    }}
                ></div>
                <div
                    className="absolute inset-0 hidden dark:block"
                    style={{
                        backgroundImage: fallbackBackgroundDark,
                        backgroundBlendMode: "saturation",
                        opacity: "0.5",
                    }}
                ></div>

                {/* Overlay for light and dark mode */}
                {!hideOverlay && (
                    <>
                        <div
                            className="absolute inset-0 dark:hidden"
                            style={{ backgroundImage: gradientOverlayLight }}
                        ></div>
                        <div
                            className="absolute inset-0 hidden dark:block"
                            style={{ backgroundImage: gradientOverlayDark }}
                        ></div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BackgroundGradient;
