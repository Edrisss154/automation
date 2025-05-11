import React from "react";

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900 p-4 sm:p-6 flex flex-col items-center">
      {/* Header with Geometric Background */}
      <div className="w-full max-w-4xl dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white text-center">
          راهنما
        </h2>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-4xl dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        {/* Introduction */}
        <div className="mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            خوش آمدید به صفحه راهنما
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            در این صفحه می‌توانید اطلاعات کاملی درباره نحوه استفاده از سیستم، امکانات موجود و راهنمای گام‌به‌گام برای استفاده از قابلیت‌های مختلف پیدا کنید. همچنین، پاورپوینت آموزشی ما در زیر قابل مشاهده است.
          </p>
        </div>

        {/* PowerPoint Embed */}
        <div className="mb-6">
        <h4 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-3">
            پاورپوینت آموزشی
        </h4>
        <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <iframe
            src="https://docs.google.com/presentation/d/1IqKTM8qMP68AkNprJ5Dv89XtvRVrmk5f/embed?start=false&loop=false&delayms=3000"
            frameBorder="0"
            width="100%"
            height="100%"
            allowFullScreen={true}
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
            title="پاورپوینت راهنما"
            ></iframe>
        </div>
        <div className="mt-2 flex space-x-4 space-x-reverse">
            
            <a
            href="https://drive.google.com/uc?export=download&id=1IqKTM8qMP68AkNprJ5Dv89XtvRVrmk5f"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-xs sm:text-sm"
            >
            دانلود پاورپوینت
            </a>
        </div>
        </div>
       
      </div>

      {/* Contact Us Section */}
      <div className="w-full max-w-4xl  dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          تماس با ما
        </h3>
        
        {/* Company Info */}
        <div className="mb-6">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
            اطلاعات تماس
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            شرکت مهندسی ساتیاری ارتباط پارس، دارنده پروانه خدمات ارتباطی به شماره ۶۵-۹۵-۱۰۰ از سازمان تنظیم مقررات و ارتباطات رادیویی
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2">
            آدرس:استان مرکزی، اراک، خیابان شهید رجایی(ملک)، ابتدای خیابان جنت کوچه واعظ زاده, ساختمان ساتیا <br />
            کد پستی: ۳۸۱۳۶۷۴۶۷۹  <br />
            شماره تماس:۰۹۴۲۶۰۳۵۸۱۴<br />
          </p>
        </div>

        {/* Map */}
        <div className="mb-6">
  <h4 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-3">
    موقعیت ما روی نقشه
  </h4>
  <div className="w-full h-[100px] sm:h-[200px] rounded-lg overflow-hidden">
    <a
      href="https://maps.app.goo.gl/jwargvmo4Y8NEepa8"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://www.satia.co/wp-content/uploads/2022/09/Rectangle-5.png"
        alt="نقشه موقعیت شرکت"
        className="w-full h-full object-cover"
      />
    </a>
  </div>
  
</div>

        {/* Social Media Links */}
        <div>
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-3">
            راه‌های ارتباطی در فضای مجازی
          </h4>
          <div className="flex space-x-4 space-x-reverse">
            <a
              href="mailto:info@satiaisp.com"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-[#A61F38] hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/satianet"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-[#A61F38] hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-1.627.073-3.043.483-4.146 1.586-1.103 1.103-1.513 2.519-1.586 4.146-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.073 1.627.483 3.043 1.586 4.146 1.103 1.103 2.519 1.513 4.146 1.586 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.627-.073 3.043-.483 4.146-1.586 1.103-1.103 1.513-2.519 1.586-4.146.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.073-1.627-.483-3.043-1.586-4.146-1.103-1.103-2.519-1.513-4.146-1.586-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.313 0-6 2.687-6 6s2.687 6 6 6 6-2.687 6-6-2.687-6-6-6zm0 10c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm4.5-10.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/satianet/about/"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-[#A61F38] hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-1.337-.027-3.063-1.867-3.063-1.872 0-2.159 1.461-2.159 2.971v5.696h-3v-11h2.878v1.496h.041c.401-.761 1.381-1.559 2.841-1.559 3.038 0 3.6 2.001 3.6 4.604v6.459z" />
              </svg>
            </a>
            <a
              href="https://t.me/satianet"
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-[#A61F38] hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.893 8.106c-.144 1.352-.693 4.629-.952 6.467-.121.859-.625 1.148-.999 1.177-.634.049-.987-.375-1.531-.848-1.078-.937-1.855-1.629-2.999-2.614-.36-.311-.128-.576.219-.854l.683-.573c.672-.563 1.385-1.229 1.846-1.677.604-.587.246-1.104-.399-1.104-.315 0-.943.146-1.677.407l-.573.219c-1.229.469-2.614 1.078-3.552 1.458-.848.344-1.531.563-1.677.573-.219.015-.469-.073-.604-.219-.135-.146-.219-.344-.188-.563.021-.146.073-.344.146-.604.292-1.104 1.385-4.896 1.677-6.104.188-.781.781-1.104 1.104-1.104.219 0 .469.073.604.219.135.146.219.344.188.563-.021.146-.073.344-.146.604-.292 1.104-1.385 4.896-1.677 6.104z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;