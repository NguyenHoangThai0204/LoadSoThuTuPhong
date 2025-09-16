
using LoadSoThuTuPhong.Models;
using LoadSoThuTuPhong.Service.IS;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LoadSoThuTuPhong.Controllers

{
    [Route("load_so_thu_tu_phong")]
    public class LoadSoThuTuPhongController : Controller
    {
        //private string _maChucNang = "/load_so_thu_tu_phong";
        //private IMemoryCachingServices _memoryCache;

        private readonly LoadSoThuTuPhongInterface _service;
        private readonly Context0302 _dbService;

        public LoadSoThuTuPhongController(LoadSoThuTuPhongInterface service, Context0302 dbService)
        {
            _service = service;
            _dbService = dbService;
        }
        public async Task<IActionResult> Index(long idChiNhanh)
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

            // lấy tên doanh nghiệp truyền vào view

            // Truy vấn EF Core
            var thongTin = await _dbService.Set<ThongTinDoanhNghiep>()
                .FirstOrDefaultAsync(x => x.IDChiNhanh == idChiNhanh);

            ViewBag.DoanhNghiep = thongTin;

            return View(thongTin); 
        }

        [HttpPost("filter")]
        public async Task<IActionResult> LoadSTT(long IdPhongBuong, long IdChiNhanh)
        {
            var result = await _service.FilterSoThuTuPhong(IdPhongBuong, IdChiNhanh);

            if (!result.Success)
            {
                return Json(new { success = false, message = result.Message, data = new List<object>() });
            }

            // Ép kiểu an toàn
            var list = result.Data as IEnumerable<LoadSoThuTuPhongModel>;
            if (list == null)
            {
                return Json(new { success = false, message = "Sai định dạng dữ liệu", data = new List<object>() });
            }

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
                data = dataList
            });
        }



    }
}