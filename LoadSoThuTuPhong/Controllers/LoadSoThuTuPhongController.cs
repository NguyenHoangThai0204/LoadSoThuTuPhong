
using LoadSoThuTuPhong.Models;
using LoadSoThuTuPhong.Service.IS;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace LoadSoThuTuPhong.Controllers

{
    [Route("load_so_thu_tu_phong")]
    public class LoadSoThuTuPhongController : Controller
    {
        //private string _maChucNang = "/load_so_thu_tu_phong";
        //private IMemoryCachingServices _memoryCache;

        private readonly LoadSoThuTuPhongInterface _service;
        private readonly Context0302 _dbService;
        private readonly IWebHostEnvironment _env;

        public LoadSoThuTuPhongController(LoadSoThuTuPhongInterface service, Context0302 dbService, IWebHostEnvironment env)
        {
            _service = service;
            _dbService = dbService;
            _env = env;
        }

        public async Task<IActionResult> Index(long? idChiNhanh)
        {
            //var quyenVaiTro = await _memoryCache.getQuyenVaiTro(_maChucNang);
            //if (quyenVaiTro == null)
            //{
            //    return RedirectToAction("NotFound", "Home");
            //}
            //ViewBag.quyenVaiTro = quyenVaiTro;
            //ViewData["Title"] = CommonServices.toEmptyData(quyenVaiTro);

            ViewBag.quyenVaiTro = new
            {
                Them = true,
                Sua = true,
                Xoa = true,
                Xuat = true,
                CaNhan = true,
                Xem = true,
            };

            if (!idChiNhanh.HasValue || idChiNhanh == 0)
            {
                idChiNhanh = GetIdcnFromBienChung();
            }
            // Truy vấn EF Core
            var thongTin = await _dbService.Set<ThongTinDoanhNghiep>()
                .FirstOrDefaultAsync(x => x.IDChiNhanh == idChiNhanh);

            ViewBag.DoanhNghiep = thongTin;

            return View(thongTin); 
        }
        private long GetIdcnFromBienChung()
        {
            try
            {
                var bienChungPath = Path.Combine(_env.WebRootPath, "dist", "js", "BienChung.js");

                if (System.IO.File.Exists(bienChungPath))
                {
                    var jsContent = System.IO.File.ReadAllText(bienChungPath);

                    // Tìm giá trị _idcn bằng regex
                    var match = Regex.Match(jsContent, @"var _idcn\s*=\s*(\d+);");
                    if (match.Success && long.TryParse(match.Groups[1].Value, out long idcn))
                    {
                        return idcn;
                    }

                    // Hoặc tìm theo cách khác nếu định dạng khác
                    match = Regex.Match(jsContent, @"_idcn\s*:\s*(\d+)");
                    if (match.Success && long.TryParse(match.Groups[1].Value, out idcn))
                    {
                        return idcn;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần
                Console.WriteLine($"Lỗi khi đọc BienChung.js: {ex.Message}");
            }

            return 2; // Giá trị mặc định nếu không đọc được
        }

        [HttpPost("filter")]
        public async Task<IActionResult> LoadSTT(long IdPhongBuong, long IdChiNhanh)
        {
            var result = await _service.FilterSoThuTuPhong(IdPhongBuong, IdChiNhanh);

            if (!result.Success)
            {
                return Json(new
                {
                    success = false,
                    message = result.Message,
                    data = new List<object>(),
                    thoiGian = 5000,
                    soDong = 5
                });
            }

            // Sử dụng reflection để kiểm tra dynamic object
            if (result.Data != null)
            {
                var dataType = result.Data.GetType();
                var dataProperty = dataType.GetProperty("Data");
                var thoiGianProperty = dataType.GetProperty("ThoiGian");
                var soDongProperty = dataType.GetProperty("SoDong");

                if (dataProperty != null && thoiGianProperty != null && soDongProperty != null)
                {
                    var dataValue = dataProperty.GetValue(result.Data);
                    var thoiGianValue = thoiGianProperty.GetValue(result.Data);
                    var soDongValue = soDongProperty.GetValue(result.Data);

                    // Ép kiểu dataValue thành List<LoadSoThuTuPhongModel>
                    var dataList = dataValue as IEnumerable<LoadSoThuTuPhongModel>;

                    if (dataList == null)
                    {
                        return Json(new
                        {
                            success = false,
                            message = "Sai định dạng dữ liệu",
                            data = new List<object>(),
                            thoiGian = 5,
                            soDong = 5
                        });
                    }

                    var formattedData = dataList
                        .Select(x => new {
                            soThuTu = x.SoThuTu,
                            tenBN = x.TenBN,
                            trangThai = x.TrangThai
                        })
                        .ToList();

                    return Json(new
                    {
                        success = true,
                        message = result.Message,
                        data = formattedData,
                        thoiGian = thoiGianValue ?? 5,
                        soDong = soDongValue ?? 5
                    });
                }
            }

            // Fallback cho trường hợp cũ
            var list = result.Data as IEnumerable<LoadSoThuTuPhongModel>;
            if (list != null)
            {
                var dataList = list
                    .Select(x => new {
                        soThuTu = x.SoThuTu,
                        tenBN = x.TenBN,
                        trangThai = x.TrangThai
                    })
                    .ToList();

                return Json(new
                {
                    success = true,
                    message = result.Message,
                    data = dataList,
                    thoiGian = 5,
                    soDong = 5
                });
            }

            return Json(new
            {
                success = false,
                message = "Sai định dạng dữ liệu",
                data = new List<object>(),
                thoiGian = 5,
                soDong = 5
            });
        }
       


    }
}