

using Microsoft.EntityFrameworkCore;

namespace LoadSoThuTuPhong.Models
{
    public class Context0302 : DbContext
    {

        public Context0302(DbContextOptions<Context0302> options) : base(options) { }
        public DbSet<ThongTinDoanhNghiep> ThongTinDoanhNghieps { get; set; }

        public DbSet<LoadSoThuTuPhongModel> LoadSoThuTuPhongModels { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ThongTinDoanhNghiep>().HasNoKey();
            modelBuilder.Entity<LoadSoThuTuPhongModel>().HasNoKey();
        }

        public bool TestConnection()
        {
            try
            {
                return this.Database.CanConnect();
            }
            catch (Exception)
            {
                return false;
            }
        }


    }
}
