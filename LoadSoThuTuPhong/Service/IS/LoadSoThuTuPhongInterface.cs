namespace LoadSoThuTuPhong.Service.IS
{
    public interface LoadSoThuTuPhongInterface
    {
        Task<(bool Success, string Message, object Data)>
            FilterSoThuTuPhong(long IDPhongBuong, long IDChiNhanh);
    }
}
