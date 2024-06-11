"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import screenshot from "../../../public/screenhotSlack.jpg";
import slacklogo from "../../../public/slack-logo.png";
import Balancer from "react-wrap-balancer";

// Assuming you have similar Tailwind CSS classes defined or use Tailwind's utility classes
interface FallInPlaceProps {
  children: React.ReactNode; // This type covers anything that can be rendered: numbers, strings, elements or an array (or fragment) containing these types.
  delay?: number; // Optional with a default value, hence marked as optional
}

const FallInPlace: React.FC<FallInPlaceProps> = ({ children, delay = 0.2 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} // Initial state before animation
    animate={{ opacity: 1, y: 0 }} // Target state after animation
    exit={{ opacity: 0 }} // Optional: state when component unmounts
    transition={{ type: "tween", ease: "easeOut", duration: 2, delay }}
  >
    {children}
  </motion.div>
);

const HeroSection = () => {
  return (
    <div>
      <div className="relative overflow-hidden ">
        <div className="max-w-10xl container mx-auto px-8 pb-40 pt-20 lg:pt-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center lg:space-x-10">
            <div className="w-full lg:w-1/2">
              <FallInPlace>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👋</span>
                  <h2 className="text-xl font-bold text-purple-600 text-base dark:text-purple-400">Hey there! We&#39;re Sinta</h2>
                </div>
              </FallInPlace>
              <FallInPlace delay={0.4}>
                <Balancer
                  as="h1"
                  className="max-w-2xl text-start font-heading text-5xl font-bold leading-none sm:text-6xl dark:text-white"
                >
                  Streamline your hiring workflows in Slack <Image src={slacklogo} alt="Slack" className="inline w-10 h-10 mb-2" />
                </Balancer>
              </FallInPlace>
              <FallInPlace delay={0.8}>
                <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
                  Design your perfect hiring strategy and bring it to life with real-time automations—simplify your process and cut through the chaos, all within your <span className="text-purple-600 dark:text-purple-400">favourite messaging app</span>.
                </p>
              </FallInPlace>
              <FallInPlace delay={1.2}>
                <div className="mt-6">
                  <button className="flex items-center space-x-2 rounded-full bg-purple-600 px-6 py-3 text-white text-lg shadow-lg hover:bg-purple-500 dark:bg-purple-700 dark:hover:bg-purple-600">
                    <span>Book a demo</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
              </FallInPlace>
            </div>

            <div className="w-full lg:w-1/2 mt-24 lg:mt-0">
              <FallInPlace delay={1}>
                <div className="relative h-[600px] max-w-[1200px] rounded-lg shadow-xl lg:w-[80vw] mx-auto">
                  <Image
                    src={screenshot}
                    layout="fill"
                    objectFit="fill"
                    alt="Screenshot of a ListPage in Saas UI Pro"
                    quality={75}
                    priority
                    className="rounded-lg object-right" // Ensure the right part of the image stays visible
                  />
                </div>
              </FallInPlace>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto pt-20">
        <div className="mb-10 text-center">
          <Balancer
            as="h3"
            className="max-w-1xl text-start font-heading text-4xl font-bold leading-none sm:text-4xl dark:text-white"
          >
            ✨ What we do
          </Balancer>
          <p className="mt-4 text-xl font-medium text-black dark:text-gray-300">
            We craft tools hiring teams <span className="underline">love to use</span>
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
            <Image src="https://assets-global.website-files.com/660df2204356cc0ae58476a5/660df2214356cc0ae58477e8_ico-1.png" className="mx-auto mb-4" width={42} height={42} alt="Easy-to-Deploy"/>
            <h3 className="text-2xl font-bold mb-2">Easy-to-Deploy</h3>
            <p>
              Install and set up our plugins in 30 minutes or less.
              No engineering resources required.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
            <Image src="https://assets-global.website-files.com/660df2204356cc0ae58476a5/660df2214356cc0ae58477e8_ico-1.png" className="mx-auto mb-4" width={42} height={42} alt="Cost-Effective"/>
            <h3 className="text-2xl font-bold mb-2">Cost-Effective</h3>
            <p>
              Stop paying hidden fees or enterprise rates. Finally, recruiting tools that won&#x27;t break the bank.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
            <Image src="https://assets-global.website-files.com/660df2204356cc0ae58476a5/660df2214356cc0ae58477e7_ico-3.png" className="mx-auto mb-4" width={42} height={42} alt="Loved by Users"/>
            <h3 className="text-2xl font-bold mb-2">Loved by Users</h3>
            <p>
              Your team loves Slack, so why send them anywhere else? Our tools have 92% adoption within the first week.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-8 pb-20 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <Image src="https://assets-global.website-files.com/660df2204356cc0ae58476a5/66103735cbac916c3c9b60ae_brandbird%20(13)-p-800.jpg" className="rounded-lg shadow-lg w-full" width={800} height={533} alt=""/>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">
                ⚡️ Centralized Communication for Every Hire
              </h3>
              <p className="text-xl text-black dark:text-gray-300">
                Organize your recruitment efforts with Slack channels dedicated to specific roles or candidates. Keep all relevant information in one place.
              </p>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col justify-center order-2 lg:order-1">
              <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">
                ⚡️ Insightful Summaries for Swift Decisions
              </h3>
              <p className="text-xl text-black dark:text-gray-300">
                Automate feedback collection and candidate status updates to drive faster hiring decisions. All key insights directly within Slack.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <Image src="https://assets-global.website-files.com/660df2204356cc0ae58476a5/661035f8465159dae39c0cb6_sintaimage-p-800.jpg" className="rounded-lg shadow-lg w-full" width={800} height={533} alt=""/>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-8 pb-20 pt-20">
          <div className="text-center mb-20">
            <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
              🚀 Who we are
            </h3>
            <p className="text-xl text-black dark:text-gray-300">
              Our vision is to help organizations build great teams <span className="underline">effortlessly</span>, creating a world where workforces are more impactful and innovative.
            </p>
          </div>

          <div className="text-center mb-20">
            <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
              💻 Our Integrations
            </h3>
            <p className="text-xl text-black dark:text-gray-300">
              Connect all your tools in <span className="underline">one place</span>.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              <div>
                <Image src="https://assets-global.website-files.com/660df2204356cc0ae58476a5/661082a39ddd11fe69a0e588_63bf4122ced9145885a65b12_g-icon-green.png" className="mx-auto mb-4" width={42} height={42} alt="Greenhouse"/>
                <h4 className="font-bold text-lg text-black dark:text-white">Greenhouse</h4>
                <p className="text-black dark:text-gray-300">Applicant tracking system and hiring platform.</p>
              </div>
              <div>
                <Image src="https://assets-global.website-files.com/660df2204356cc0ae58476a5/66108343ccff770399b666ca_Lever-233x175.png" className="mx-auto mb-4" width={42} height={42} alt="Lever"/>
                <h4 className="font-bold text-lg text-black dark:text-white">Lever</h4>
                <p className="text-black dark:text-gray-300">Applicant tracking system and hiring platform.</p>
              </div>
              <div>
                <Image src="/images/calendly-logo-vector-removebg-preview.png" className="mx-auto mb-4" width={42} height={42} alt="Calendly"/>
                <h4 className="font-bold text-lg text-black dark:text-white">Calendly</h4>
                <p className="text-black dark:text-gray-300">Appointment Scheduling Software</p>
              </div>
              <div>
                <Image src="/images/ashbylogo.png" className="mx-auto mb-4" width={42} height={42} alt="Ashby"/>
                <h4 className="font-bold text-lg text-black dark:text-white">Ashby</h4>
                <p className="text-black dark:text-gray-300">Applicant tracking system and hiring platform.</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-20">
            <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
              💵 Pricing
            </h3>
            <p className="text-xl text-black dark:text-gray-300">
              Versatile options tailored to suit <span className="underline">teams</span> of all sizes.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
                <h4 className="text-2xl font-bold mb-2">STARTER</h4>
                <p className="text-4xl font-bold">$15</p>
                <p className="mb-4">per user / per month</p>
                <p>BILLED ANNUALLY<br/>OR $19 BILLED MONTHLY.</p>
                <p className="mt-4">For small teams up to 50 users</p>
                <p className="mt-2">Basic Applicant Tracking System (ATS) integration, automated interview scheduling, feedback collection.</p>
                <a href="https://cal.com/mohamed-sinta/beta?" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition duration-300">Get Started</a>
              </div>
              <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
                <h4 className="text-2xl font-bold mb-2">GROWTH</h4>
                <p className="text-4xl font-bold">$60</p>
                <p className="mb-4">per employee / per month</p>
                <p>BILLED ANNUALLY<br/>OR $50 BILLED MONTHLY.</p>
                <p className="mt-4">Expanding teams up to 200 users</p>
                <p className="mt-2">Includes all Starter features plus advanced reporting, candidate tracking, enhanced security settings.</p>
                <a href="https://cal.com/mohamed-sinta/beta?" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition duration-300">Get Started</a>
              </div>
              <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
                <h4 className="text-2xl font-bold mb-2">ENTERPRISE</h4>
                <p className="text-4xl font-bold">Let&#39;s Talk</p>
                <p className="mb-4">We&#39;ll put together a plan that works</p>
                <p>BILLED ANNUALLY<br/>CONTACT US FOR PRICING</p>
                <p className="mt-4">Full customization, unlimited users</p>
                <p className="mt-2">Includes all Growth features, unlimited users, full API access, dedicated account management.</p>
                <a href="https://cal.com/mohamed-sinta/beta?" className="inline-block mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition duration-300">Chat with us</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">
            !? Frequently asked questions
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
              <h4 className="text-xl font-bold mb-2">What is the definition of a user?</h4>
              <p>A user is anyone who has access to the Sinta platform.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
              <h4 className="text-xl font-bold mb-2">Do you have a free trial?</h4>
              <p>While we don&#x27;t have a free trial, we do offer a 60-day money back guarantee.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-6 shadow-lg">
              <h4 className="text-xl font-bold mb-2">What if I have inactive users?</h4>
              <p>We believe you should only be billed for what you use. Please see our Fair Billing Policy here.</p>
            </div>
          </div>
        </div>
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <h3 className="text-3xl font-bold mb-4">
            💡 Contact us
          </h3>
          <p className="text-xl mb-6">
            Contact us today for a demo. Say goodbye 👋 to disorganized and unproductive.
          </p>
          <a href="https://cal.com/mohamed-sinta/beta?" className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-md font-bold hover:bg-gray-200 transition duration-300">Let&#39;s Talk</a>
        </div>
        <footer className="bg-gray-900 text-white py-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <a href="/" aria-current="page" className="mb-6">
                  <Image src="/images/6457f2617575798a80fbb8d5_Pasted-Graphic-1.png" loading="lazy" width={150} height={50} alt="" className="invert-logo"/>
                </a>
                <p className="text-center lg:text-left">
                  Streamline your hiring workflows in Slack. Slack-based recruitment automation for modern hiring teams.
                </p>
                <div className="mt-6">
                  <p className="font-bold">Sign up for our newsletter</p>
                  <form id="wf-form-Subscribe" name="wf-form-Subscribe" data-name="Subscribe" method="get" className="flex mt-4">
                    <input className="w-full p-2 text-black rounded-l-md" maxLength={256} name="Subscribe-2" data-name="Subscribe 2" placeholder="Enter your email..." type="email" id="Subscribe-2" required/>
                    <button type="submit" data-wait="Please wait..." className="bg-indigo-600 p-2 text-white rounded-r-md">Subscribe</button>
                  </form>
                </div>
              </div>
              <div className="flex flex-col items-center lg:items-end">
                <p className="font-bold mb-4">Find us</p>
                <div className="flex space-x-4">
                  <a href="#" className="social-link-2">
                    <Image src="/images/x-logo.png" loading="lazy" alt="" width={20} height={20} className="social-icon no-invert" />
                  </a>
                  <a href="#" className="social-link-2">
                    <Image src="/images/icons8-facebook-240-1.png" loading="lazy" width={20} height={20} alt="" className="social-icon no-invert" />
                  </a>
                  <a href="#" className="social-link-2">
                    <Image src="https://uploads-ssl.webflow.com/64dde8491796b73c619e78bf/64dde8491796b73c619e794d_social-4.png" loading="lazy" width={20} height={20} alt="" className="social-icon" />
                  </a>
                  <a href="#" className="social-link-2">
                    <Image src="https://uploads-ssl.webflow.com/64dde8491796b73c619e78bf/64dde8491796b73c619e794c_social-3.png" loading="lazy" width={20} height={20} alt="" className="social-icon" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HeroSection;
