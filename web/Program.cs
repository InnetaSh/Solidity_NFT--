using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Добавляем CORS политику
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5062")  // укажи фронтенд origin
              .AllowAnyHeader()
              .AllowAnyMethod();
              //.AllowCredentials(); // ОБЯЗАТЕЛЬНО для credentials: "include"
    });
});

var app = builder.Build();

// Используем CORS с указанной политикой
app.UseCors("AllowFrontend");

app.UseDefaultFiles();
app.UseStaticFiles();

//app.MapPost("/upload", async (HttpContext context) =>
//{
//    // Твой обработчик POST /upload
//    // Например:
//    var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
//    Console.WriteLine("Получено тело: " + body);

//    // Просто вернём тестовый ответ
//    context.Response.ContentType = "application/json";
//    await context.Response.WriteAsync("{\"IpfsHash\":\"QmTestHash\"}");
//});

//app.MapGet("/upload", () => "Этот маршрут принимает только POST-запросы.");

app.Run();
