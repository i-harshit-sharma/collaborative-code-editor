import { useState } from 'react';
const SettingDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [fill, setFill] = useState('#555');
    function handleSettings() {
        console.log("Settings Clicked");
        setFill(fill == '#555' ? '#212178' : '#555');
    }

    function SettingItem({ path, title, style }) {
        const [fill, setFill] = useState('#555');
        return (
            <button className={`${style} w-full h-0 hover:bg-gray-300 px-2 py-1 `} onMouseEnter={() => setFill('#212178')} onMouseLeave={() => setFill('#555')} title={title}>
                <span className='flex items-center justify-center '>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -32 576 576" className='w-5 h-5' fill={fill}>
                        <path d={path}>
                        </path>
                    </svg>
                </span>
            </button>
        )
    }

    return (
        <div
            className="hidden sm:block"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className='w-7 h-7 ' onClick={() => {
                setIsOpen(!isOpen);
                handleSettings()
            }
            } onMouseEnter={() => setFill('#212178')}
                onMouseLeave={() => {isOpen?setFill('#212178'):setFill('#555')}}>
                <svg className='hover:animate-spinSetting' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill={fill}><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"></path></svg></button>

            <div
            onMouseLeave={()=>setFill('#555')}
                className={`absolute right-[-6px] mt-0 w-15 bg-white border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
                    }`}
            >
                <ul className="text-gray-800">
                    <li className="pb-3 pt-2">
                        <div className="border-[1px] border-[#66666666] rounded-[7px]">
                            <SettingItem path="M8 256c0 136.966 111.033 248 248 248s248-111.034 248-248S392.966 8 256 8 8 119.033 8 256zm248 184V72c101.705 0 184 82.311 184 184 0 101.705-82.311 184-184 184z" title="use system theme" style="rounded-t-[5px]" />
                            <SettingItem path="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4  -94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z" title="use light theme" />
                            <SettingItem path="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z" title="use dark theme" style="rounded-b-[5px]" />
                        </div>
                    </li>
                    <li className="">
                        <div className="border-2 hover:border-gray-400 rounded-[7px]">
                            <SettingItem path="M332.3 64H224C171.06 64 128 107.06 128 160C128 177.67 142.31 191.1 160 191.1C177.69 191.1 192 176.78 192 160C192 142.36 206.34 128 224 128H332.3C360.8 128 384 151.19 384 179.79C384 199.51 373.03 217.26 353.5 227.12L255.8 284.39C245.1 290.19 240 300.69 240 311.99V351.99C240 369.66 254.31 383.98 272 383.98C289.69 383.98 304 369.66 304 351.99V330.29L384 283.29C423.47 263.54 448 223.87 448 179.79C448 115.94 396.1 64 332.3 64ZM272 431.99C249.91 431.99 232 449.9 232 471.99C232 494.08 249.91 511.09 272 511.09C294.09 511.09 312 493.19 312 471.99C312 450.79 294.1 431.99 272 431.99Z" title="get help" />
                        </div>
                    </li>
                </ul>
            </div>
        </div >
    );
};
export default SettingDropdown;