1. breadcrumbs
2. wishlist functonality
3. cart functionality

Steps Grid
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
{guideSteps.map((item) => (
<div key={item.step} className="text-center group">
{/_ Step Number & Icon _/}
<div className="relative mb-6">
<div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center text-primary-content font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
{item.step}
</div>
<div className="absolute -top-2 -right-2 text-2xl">
{item.icon}
</div>
</div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-base-content mb-3">
                {item.title}
              </h3>
              <p className="text-base-content/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="btn btn-primary btn-lg">Get Started Today</button>
        </div>
