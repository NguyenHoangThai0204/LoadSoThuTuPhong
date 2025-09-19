
using LoadSoThuTuPhong.Service.IS;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

using LoadSoThuTuPhong.Models;
namespace LoadSoThuTuPhong.Service
{
    public class LoadSoThuTuPhongService : LoadSoThuTuPhongInterface
    {
        private readonly Context0302 _dbService;
        private readonly ILogger<LoadSoThuTuPhongService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LoadSoThuTuPhongService(Context0302 dbService,
            ILogger<LoadSoThuTuPhongService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbService = dbService;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<(bool Success, string Message, object Data)>
            FilterSoThuTuPhong(long IdPhongBuong, long IdChiNhanh)
        {
            try
            {
                double thoiGianCapNhat = 5000;
                int soDongHienThi = 5;

                // Xử lý lấy cấu hình với try-catch
                try
                {
                    var caiDat = await _dbService.HT_CaiDatSTT
                         .FirstOrDefaultAsync(x => x.Loai == "Phong");

                    if (caiDat != null)
                    {
                        thoiGianCapNhat = caiDat.ThoiGian;
                        soDongHienThi = caiDat.SoDong ?? 5;

                    }
                }
                catch (Exception configEx)
                {
                    _logger.LogWarning(configEx, "Không thể lấy cấu hình từ HT_CaiDatSTT, sử dụng mặc định");
                }

                _logger.LogInformation("Được gọi lại");
                var allData = await _dbService.LoadSoThuTuPhongModels
                    .FromSqlRaw("EXEC LoadSoThuTuPhong @IdPhongBuong, @IdChiNhanh",
                        new SqlParameter("@IdPhongBuong", IdPhongBuong),
                        new SqlParameter("@IdChiNhanh", IdChiNhanh))
                    .AsNoTracking()
                    .ToListAsync();

           
                if (!allData.Any())
                {
                    return (true, "Không có dữ liệu", new
                    {
                        Paged = new List<object>(),
                        Full = new List<object>(),
                        ThoiGian = thoiGianCapNhat,
                        SoDong = soDongHienThi
                    });
                }

                return (true, "Thành công", new
                {
                    Data = allData,
                    ThoiGian = thoiGianCapNhat,
                    SoDong = soDongHienThi
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi filter số thứ tự phòng");
                return (false, ex.Message, null);
            }
        }
        
    }
}