using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// ��������� CORS ��������
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5062")  // ����� �������� origin
              .AllowAnyHeader()
              .AllowAnyMethod();
              //.AllowCredentials(); // ����������� ��� credentials: "include"
    });
});

var app = builder.Build();

// ���������� CORS � ��������� ���������
app.UseCors("AllowFrontend");

app.UseDefaultFiles();
app.UseStaticFiles();

//app.MapPost("/upload", async (HttpContext context) =>
//{
//    // ���� ���������� POST /upload
//    // ��������:
//    var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
//    Console.WriteLine("�������� ����: " + body);

//    // ������ ����� �������� �����
//    context.Response.ContentType = "application/json";
//    await context.Response.WriteAsync("{\"IpfsHash\":\"QmTestHash\"}");
//});

//app.MapGet("/upload", () => "���� ������� ��������� ������ POST-�������.");

app.Run();
