const ForecastView = () => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
    <h2 className="text-xl font-bold mb-4 text-gray-800">ការទស្សន៍ទាយសម្រាប់ខែឧសភា</h2>
    <p className="text-gray-600 mb-6">ផ្អែកលើទិន្នន័យ ៤ ខែចុងក្រោយ ប្រព័ន្ធ AI បានប៉ាន់ស្មានថា៖</p>
    
    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 mb-6">
      <p className="font-bold text-yellow-700 underline">ការចំណាយរំពឹងទុក: $1,150</p>
      <p className="text-sm text-yellow-600 mt-1">
        អ្នកអាចនឹងចំណាយច្រើនជាងមធ្យមភាគ 5% ដោយសារនិន្នាការកើនឡើងក្នុងខែមេសា។
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
        <p className="text-sm text-green-700 font-semibold">លទ្ធភាពសន្សំ</p>
        <p className="text-xl font-bold text-green-800">$450 - $600</p>
      </div>
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700 font-semibold">ស្ថានភាពហិរញ្ញវត្ថុ</p>
        <p className="text-xl font-bold text-blue-800">មានស្ថេរភាព</p>
      </div>
    </div>

    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
      ទាញយករបាយការណ៍លម្អិត (.PDF)
    </button>
  </div>
);

export default ForecastView;