
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


                var allData = await _dbService.LoadSoThuTuPhongModels
                 .FromSqlRaw("EXEC LoadSoThuTuPhong @IdPhongBuong, @IdChiNhanh",
                     new SqlParameter("@IdPhongBuong", IdPhongBuong),
                     new SqlParameter("@IdChiNhanh", IdChiNhanh))
                 .AsNoTracking()
                 .ToListAsync();

                // Log chi tiết từng record
                foreach (var item in allData)
                {
                    _logger.LogInformation("STT={STT}, TenBN={TenBN}, TrangThai={TrangThai}",
                        item.SoThuTu,
                        item.TenBN,
                        item.TrangThai);
                }
                // Nếu allData rỗng, trả về trống
                if (!allData.Any())
                {
                    return (true, "Không có dữ liệu", new { Paged = new List<object>(), Full = new List<object>() });
                }


                return (true, "Thành công", allData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi filter số thứ tự phòng");
                return (false, ex.Message, null);
            }
        }
    }
}